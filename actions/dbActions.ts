"use server";

import { prisma } from "@/lib/prisma";
import { Role, SettlementStatus } from "@prisma/client";

// Helper to deep clone and convert non-serializable items like Date to plain string representation for Next.js Server Actions
function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

// 1. User Management Actions
export async function dbGetUserByEmail(email: string) {
  return serialize(await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  }));
}

export async function dbRegisterUser(name: string, email: string, password = "password", role: Role = Role.USER) {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { name, password }
    });
    return serialize(updated);
  }

  return serialize(await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password,
      role
    }
  }));
}

export async function dbPromoteUser(userId: string) {
  return serialize(await prisma.user.update({
    where: { id: userId },
    data: { role: Role.LEADER }
  }));
}

export async function dbDeleteUser(userId: string) {
  return serialize(await prisma.user.delete({
    where: { id: userId }
  }));
}

export async function dbGetAllUsers() {
  return serialize(await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  }));
}

// 2. Group/Trip Management Actions
export async function dbCreateGroup(
  name: string,
  leaderId: string,
  description?: string,
  totalMembers = 10,
  tripDate?: string,
  budget = 0
) {
  return serialize(await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name,
        description: description || "",
        leaderId,
        totalMembers: parseInt(String(totalMembers), 10) || 10,
        tripDate: tripDate ? new Date(tripDate) : null,
        budget: parseFloat(String(budget)) || 0,
        perPersonCost: 0
      }
    });

    await tx.groupMember.create({
      data: {
        groupId: group.id,
        userId: leaderId,
        paidAmount: 0
      }
    });

    return group;
  }));
}

export async function dbDeleteGroup(groupId: string) {
  return serialize(await prisma.group.delete({
    where: { id: groupId }
  }));
}

export async function dbAddMemberToGroup(groupId: string, userId: string) {
  return serialize(await prisma.groupMember.create({
    data: {
      groupId,
      userId,
      paidAmount: 0
    }
  }));
}

export async function dbUpdateMemberPaidAmount(groupId: string, userId: string, paidAmount: number) {
  return serialize(await prisma.groupMember.update({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    },
    data: {
      paidAmount
    }
  }));
}

export async function dbGetAllGroups() {
  return serialize(await prisma.group.findMany({
    include: {
      leader: true,
      members: { include: { user: true } }
    }
  }));
}

// 3. WhatsApp Direct Invitation Flow
export async function dbAddMemberAndGenerateWhatsAppInvite(groupId: string, phone: string) {
  return serialize(await prisma.$transaction(async (tx) => {
    // 1. Fetch trip group details
    const group = await tx.group.findUnique({
      where: { id: groupId },
      include: { leader: true }
    });
    if (!group) throw new Error("Trip not found");

    // 2. Generate unique token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // 3. Upsert invitation
    const invitation = await tx.groupInvitation.create({
      data: {
        groupId,
        phone,
        token
      }
    });

    // 4. Generate direct-link and pre-filled WhatsApp API URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${appUrl}/join?token=${token}`;
    const text = `Hey! I added you to our trip "${group.name}" on TripSplit! Click this link to directly join the trip and start splitting expenses with us: ${inviteLink}`;
    
    // Format phone (remove +, spaces, leading zeros if present)
    const formattedPhone = phone.replace(/[^0-9]/g, "");
    const inviteUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;

    return {
      success: true,
      invitation,
      inviteLink,
      inviteUrl
    };
  }));
}

// 4. Direct WhatsApp Join/Login Action
export async function dbJoinTripViaToken(token: string, name: string) {
  return serialize(await prisma.$transaction(async (tx) => {
    // 1. Resolve token
    const invitation = await tx.groupInvitation.findUnique({
      where: { token },
      include: { group: true }
    });
    if (!invitation) return null;

    // 2. Generate unique shell email based on name and token to allow passwordless direct join
    const cleanName = name.replace(/\s+/g, "").toLowerCase();
    const uniqueEmail = `${cleanName}_${token.substring(0, 6)}@tripsplit.com`;

    // 3. Register/retrieve user profile
    let user = await tx.user.create({
      data: {
        name,
        email: uniqueEmail,
        phone: invitation.phone,
        password: "password", // default password
        role: Role.USER
      }
    });

    // 4. Check if they are already in the group
    const membership = await tx.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: invitation.groupId,
          userId: user.id
        }
      }
    });

    // 5. Add to group members if not present
    if (!membership) {
      await tx.groupMember.create({
        data: {
          groupId: invitation.groupId,
          userId: user.id,
          paidAmount: 0
        }
      });
    }

    // 6. Delete invitation so it is single-use
    await tx.groupInvitation.delete({
      where: { token }
    });

    return {
      success: true,
      user,
      groupId: invitation.groupId
    };
  }));
}

// 5. Expense & Splits Actions
export async function dbAddExpense(
  groupId: string,
  paidById: string,
  amount: number,
  category: string,
  description: string,
  splitsList: { userId: string; amount: number }[]
) {
  return serialize(await prisma.$transaction(async (tx) => {
    // 1. Create Expense
    const expense = await tx.expense.create({
      data: {
        groupId,
        paidById,
        amount,
        category,
        description
      }
    });

    // 2. Create Splits
    const splitData = splitsList.map((s) => ({
      expenseId: expense.id,
      userId: s.userId,
      amount: s.amount
    }));

    await tx.split.createMany({
      data: splitData
    });

    // 3. Generate settlements in PENDING state
    for (const split of splitsList) {
      if (split.userId !== paidById && split.amount > 0) {
        await tx.settlement.create({
          data: {
            groupId,
            fromUserId: split.userId,
            toUserId: paidById,
            amount: split.amount,
            status: SettlementStatus.PENDING
          }
        });
      }
    }

    return expense;
  }));
}

export async function dbDeleteExpense(expenseId: string) {
  return serialize(await prisma.expense.delete({
    where: { id: expenseId }
  }));
}

// 6. Settlement Actions
export async function dbMarkSettlementAsPaid(settlementId: string) {
  return serialize(await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: SettlementStatus.PENDING_VERIFICATION }
  }));
}

export async function dbVerifySettlement(settlementId: string) {
  return serialize(await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: SettlementStatus.VERIFIED }
  }));
}

export async function dbRejectSettlement(settlementId: string) {
  return serialize(await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: SettlementStatus.PENDING }
  }));
}

export async function dbCreateDirectPaymentClaim(
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number
) {
  return serialize(await prisma.settlement.create({
    data: {
      groupId,
      fromUserId,
      toUserId,
      amount,
      status: SettlementStatus.PENDING_VERIFICATION
    }
  }));
}

// 7. Notification Actions
export async function dbCreateNotification(userId: string, title: string, message: string) {
  return serialize(await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      read: false
    }
  }));
}

export async function dbMarkNotificationRead(id: string) {
  return serialize(await prisma.notification.update({
    where: { id },
    data: { read: true }
  }));
}

export async function dbClearNotifications(userId: string) {
  return serialize(await prisma.notification.deleteMany({
    where: { userId }
  }));
}

// 8. Bulk Database Pull Action
export async function dbFetchAllPlatformData() {
  const [users, groups, groupMembers, expenses, splits, settlements, notifications, invitations] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.group.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.groupMember.findMany({ orderBy: { joinedAt: "asc" } }),
    prisma.expense.findMany({ orderBy: { date: "desc" } }),
    prisma.split.findMany(),
    prisma.settlement.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.groupInvitation.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  return serialize({
    users: users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })),
    groups: groups.map(g => ({
      ...g,
      createdAt: g.createdAt.toISOString(),
      tripDate: g.tripDate ? g.tripDate.toISOString() : null
    })),
    groupMembers: groupMembers.map(m => ({ ...m, joinedAt: m.joinedAt.toISOString() })),
    expenses: expenses.map(e => ({ ...e, date: e.date.toISOString() })),
    splits,
    settlements: settlements.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString()
    })),
    notifications: notifications.map(n => ({
      ...n,
      createdAt: n.createdAt.toISOString()
    })),
    invitations: invitations.map(i => ({
      ...i,
      createdAt: i.createdAt.toISOString()
    }))
  });
}
