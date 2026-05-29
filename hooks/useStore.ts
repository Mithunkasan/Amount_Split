import { create } from "zustand";
import {
  dbFetchAllPlatformData,
  dbRegisterUser,
  dbPromoteUser,
  dbDeleteUser,
  dbCreateGroup,
  dbAddMemberToGroup,
  dbUpdateMemberPaidAmount,
  dbDeleteGroup,
  dbAddExpense,
  dbDeleteExpense,
  dbMarkSettlementAsPaid,
  dbVerifySettlement,
  dbRejectSettlement,
  dbCreateDirectPaymentClaim,
  dbCreateNotification,
  dbMarkNotificationRead,
  dbClearNotifications,
  dbAddMemberAndGenerateWhatsAppInvite,
  dbJoinTripViaToken
} from "@/actions/dbActions";
import { Role as DbRole } from "@prisma/client";

export interface GroupInvitation {
  id: string;
  groupId: string;
  email: string | null;
  phone: string | null;
  token: string;
  createdAt: string;
}

export type Role = "ADMIN" | "LEADER" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  leaderId: string;
  perPersonCost: number;
  totalMembers: number;
  tripDate: string | null;
  budget: number;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  paidAmount: number;
  joinedAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  paidById: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Split {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
}

export type SettlementStatus = "PENDING" | "PENDING_VERIFICATION" | "VERIFIED";

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: SettlementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SimplifiedDebt {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

interface TripSplitState {
  // Session Cache State
  currentUser: User | null;
  
  // Real Database cached records
  users: User[];
  groups: Group[];
  groupMembers: GroupMember[];
  expenses: Expense[];
  splits: Split[];
  settlements: Settlement[];
  notifications: Notification[];
  invitations: GroupInvitation[];
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  
  // Sync Actions
  fetchFromDb: () => Promise<void>;
  
  // Live DB Action Mutators
  registerUser: (name: string, email: string, password?: string, role?: Role) => Promise<User | null>;
  loginUser: (email: string, password?: string) => Promise<User | null>;
  logoutUser: () => void;
  promoteToLeader: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  createGroup: (
    name: string,
    leaderId: string,
    description?: string,
    totalMembers?: number,
    tripDate?: string,
    budget?: number
  ) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, userId: string) => Promise<boolean>;
  updateMemberPaidAmount: (groupId: string, userId: string, paidAmount: number) => Promise<void>;
  
  addMemberAndGenerateWhatsAppInvite: (
    groupId: string,
    phone: string
  ) => Promise<{ success: boolean; inviteLink: string; inviteUrl: string; invitation: any } | null>;
  joinTripViaToken: (token: string, name: string) => Promise<{ success: boolean; user: any; groupId: string } | null>;
  
  addExpense: (
    groupId: string,
    paidById: string,
    amount: number,
    category: string,
    description: string,
    splitsData: { userId: string; amount: number }[]
  ) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  
  markAsSettled: (settlementId: string) => Promise<void>;
  createSettlementClaim: (groupId: string, fromUserId: string, toUserId: string, amount: number) => Promise<void>;
  verifySettlement: (settlementId: string) => Promise<void>;
  rejectSettlement: (settlementId: string) => Promise<void>;
  
  markNotificationRead: (notifId: string) => Promise<void>;
  clearNotifications: (userId: string) => Promise<void>;
  
  // Helper calculations (Selectors)
  getTripSummary: (groupId: string) => {
    totalSpent: number;
    equalShare: number;
    budgetProgress: number; // percentage
    remainingBudget: number;
    memberBalances: { userId: string; name: string; email: string; paid: number; net: number }[];
    simplifiedDebts: SimplifiedDebt[];
  };
}

// Local Storage helpers
const getLocalStorage = (key: string, fallback: any) => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  }
  return fallback;
};

const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const toIsoString = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  if (typeof val.toISOString === "function") return val.toISOString();
  return String(val);
};

export const useStore = create<TripSplitState>((set, get) => {
  const currentUser = getLocalStorage("ts_currentuser", null);

  // Enforce dark mode class on HTML body for premium aesthetics
  if (typeof window !== "undefined") {
    document.documentElement.classList.add("dark");
  }

  return {
    currentUser,
    users: [],
    groups: [],
    groupMembers: [],
    expenses: [],
    splits: [],
    settlements: [],
    notifications: [],
    invitations: [],

    setCurrentUser: (user) => {
      set({ currentUser: user });
      setLocalStorage("ts_currentuser", user);
    },

    fetchFromDb: async () => {
      try {
        const data = await dbFetchAllPlatformData();
        
        let activeUser = get().currentUser;
        if (activeUser) {
          const exists = data.users.find(u => u.id === activeUser?.id);
          if (!exists) {
            activeUser = null;
          } else {
            activeUser = exists as any;
          }
        }

        set({
          users: data.users as any[],
          groups: data.groups as any[],
          groupMembers: data.groupMembers as any[],
          expenses: data.expenses as any[],
          splits: data.splits as any[],
          settlements: data.settlements as any[],
          notifications: data.notifications as any[],
          invitations: data.invitations as any[],
          currentUser: activeUser
        });
        setLocalStorage("ts_currentuser", activeUser);
      } catch (err) {
        console.error("Failed to batch fetch platform data from PostgreSQL:", err);
      }
    },

    registerUser: async (name, email, password = "password", role = "USER") => {
      const newUser = await dbRegisterUser(name, email, password, role as DbRole);
      await get().fetchFromDb();
      if (newUser) {
        const formattedUser = { ...newUser, createdAt: toIsoString(newUser.createdAt) };
        set({ currentUser: formattedUser as any });
        setLocalStorage("ts_currentuser", formattedUser);
        return formattedUser as any;
      }
      return null;
    },

    loginUser: async (email, password = "password") => {
      await get().fetchFromDb();
      const match = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        if (match.email.toLowerCase() === "admin@matttrip.com") {
          if (password !== "Matt@4321admin") return null;
        } else {
          if (password !== "password" && password !== "Matt@4321admin") return null;
        }
        set({ currentUser: match });
        setLocalStorage("ts_currentuser", match);
        return match;
      }
      return null;
    },

    logoutUser: () => {
      set({ currentUser: null });
      setLocalStorage("ts_currentuser", null);
    },

    promoteToLeader: async (userId) => {
      await dbPromoteUser(userId);
      await get().fetchFromDb();
    },

    deleteUser: async (userId) => {
      await dbDeleteUser(userId);
      await get().fetchFromDb();
    },

    createGroup: async (name, leaderId, description, totalMembers, tripDate, budget) => {
      const group = await dbCreateGroup(name, leaderId, description, totalMembers, tripDate, budget);
      await get().fetchFromDb();
      return { ...group, createdAt: toIsoString(group.createdAt), tripDate: toIsoString(group.tripDate) } as any;
    },

    deleteGroup: async (groupId) => {
      await dbDeleteGroup(groupId);
      await get().fetchFromDb();
    },

    addMemberToGroup: async (groupId, userId) => {
      await dbAddMemberToGroup(groupId, userId);
      await get().fetchFromDb();
      return true;
    },

    updateMemberPaidAmount: async (groupId, userId, paidAmount) => {
      await dbUpdateMemberPaidAmount(groupId, userId, paidAmount);
      await get().fetchFromDb();
    },

    addMemberAndGenerateWhatsAppInvite: async (groupId, phone) => {
      const res = await dbAddMemberAndGenerateWhatsAppInvite(groupId, phone);
      await get().fetchFromDb();
      return res as any;
    },

    joinTripViaToken: async (token, name) => {
      const res = await dbJoinTripViaToken(token, name);
      if (res && res.success && res.user) {
        const formattedUser = { ...res.user, createdAt: toIsoString(res.user.createdAt) };
        set({ currentUser: formattedUser as any });
        setLocalStorage("ts_currentuser", formattedUser);
      }
      await get().fetchFromDb();
      return res as any;
    },

    addExpense: async (groupId, paidById, amount, category, description, splitsData) => {
      const expense = await dbAddExpense(groupId, paidById, amount, category, description, splitsData);
      
      const sender = get().users.find(u => u.id === paidById);
      for (const s of splitsData) {
        if (s.userId !== paidById && s.amount > 0) {
          await dbCreateNotification(
            s.userId,
            "New Expense Split Added",
            `${sender?.name || "A leader"} added a $${amount} expense for ${description}. Your split portion is $${s.amount}.`
          );
        }
      }

      await get().fetchFromDb();
      return { ...expense, date: toIsoString(expense.date) } as any;
    },

    deleteExpense: async (expenseId) => {
      await dbDeleteExpense(expenseId);
      await get().fetchFromDb();
    },

    markAsSettled: async (settlementId) => {
      const updated = await dbMarkSettlementAsPaid(settlementId);
      
      const sender = get().users.find(u => u.id === updated.fromUserId);
      await dbCreateNotification(
        updated.toUserId,
        "Settlement Payment Logged",
        `${sender?.name || "A member"} claimed they settled a payment of $${updated.amount} with you. Click to verify.`
      );

      await get().fetchFromDb();
    },

    createSettlementClaim: async (groupId, fromUserId, toUserId, amount) => {
      const claim = await dbCreateDirectPaymentClaim(groupId, fromUserId, toUserId, amount);
      const sender = get().users.find(u => u.id === fromUserId);
      
      await dbCreateNotification(
        toUserId,
        "Direct Payment Logged",
        `${sender?.name || "A member"} initiated a direct payment claim of $${amount}. Click to verify.`
      );

      await get().fetchFromDb();
    },

    verifySettlement: async (settlementId) => {
      const updated = await dbVerifySettlement(settlementId);
      const receiver = get().users.find(u => u.id === updated.toUserId);
      
      await dbCreateNotification(
        updated.fromUserId,
        "Payment Verified ✅",
        `${receiver?.name || "The leader"} verified your payment of $${updated.amount}!`
      );

      await get().fetchFromDb();
    },

    rejectSettlement: async (settlementId) => {
      const updated = await dbRejectSettlement(settlementId);
      const receiver = get().users.find(u => u.id === updated.toUserId);
      
      await dbCreateNotification(
        updated.fromUserId,
        "Payment Disputed ❌",
        `${receiver?.name || "The leader"} could not verify your payment of $${updated.amount}. Please verify details.`
      );

      await get().fetchFromDb();
    },

    markNotificationRead: async (notifId) => {
      await dbMarkNotificationRead(notifId);
      await get().fetchFromDb();
    },

    clearNotifications: async (userId) => {
      await dbClearNotifications(userId);
      await get().fetchFromDb();
    },

    // Premium Smart split calculation and greedy simplified debt resolution engine
    getTripSummary: (groupId: string) => {
      const state = get();
      
      // 1. Get all expenses for this group
      const tripExpenses = state.expenses.filter(e => e.groupId === groupId);
      const totalSpent = tripExpenses.reduce((sum, e) => sum + e.amount, 0);

      // 2. Get all group members and corresponding user details
      const memberships = state.groupMembers.filter(m => m.groupId === groupId);
      const memberCount = memberships.length;
      
      const equalShare = memberCount > 0 ? Number((totalSpent / memberCount).toFixed(2)) : 0;

      // 3. Find group budget details
      const groupObj = state.groups.find(g => g.id === groupId);
      const budget = groupObj?.budget || 0;
      const budgetProgress = budget > 0 ? Math.min(100, Number(((totalSpent / budget) * 100).toFixed(1))) : 0;
      const remainingBudget = Math.max(0, budget - totalSpent);

      // 4. Calculate total paid and net balance per member
      const memberBalances = memberships.map(m => {
        const userObj = state.users.find(u => u.id === m.userId);
        const name = userObj?.name || "Invited Member";
        const email = userObj?.email || "";
        
        const totalPaid = tripExpenses
          .filter(e => e.paidById === m.userId)
          .reduce((sum, e) => sum + e.amount, 0);

        // Net balance is total paid minus equal share
        const net = Number((totalPaid - equalShare).toFixed(2));

        return {
          userId: m.userId,
          name,
          email,
          paid: totalPaid,
          net
        };
      });

      // 5. Greedy Debt-Simplification Algorithm (Minimizes transactions)
      const simplifiedDebts: SimplifiedDebt[] = [];
      
      // Clone balances to avoid mutating state
      const balances = memberBalances.map(m => ({ ...m }));

      // Separate into debtors (net < 0) and creditors (net > 0)
      let debtors = balances.filter(b => b.net < -0.01).sort((a, b) => a.net - b.net); // Ascending (most negative first)
      let creditors = balances.filter(b => b.net > 0.01).sort((a, b) => b.net - a.net); // Descending (most positive first)

      let loopLimit = 100; // Fail-safe to prevent infinite loops
      while (debtors.length > 0 && creditors.length > 0 && loopLimit > 0) {
        loopLimit--;
        const debtor = debtors[0];
        const creditor = creditors[0];

        const debtAmount = Math.abs(debtor.net);
        const creditAmount = creditor.net;

        // Transaction is the minimum of what debtor owes and what creditor is owed
        const transactionAmount = Number(Math.min(debtAmount, creditAmount).toFixed(2));

        if (transactionAmount > 0) {
          simplifiedDebts.push({
            fromUserId: debtor.userId,
            fromUserName: debtor.name,
            toUserId: creditor.userId,
            toUserName: creditor.name,
            amount: transactionAmount
          });

          // Adjust net balances
          debtor.net = Number((debtor.net + transactionAmount).toFixed(2));
          creditor.net = Number((creditor.net - transactionAmount).toFixed(2));
        }

        // Re-filter and sort active debtors/creditors
        debtors = debtors.filter(b => b.net < -0.01).sort((a, b) => a.net - b.net);
        creditors = creditors.filter(b => b.net > 0.01).sort((a, b) => b.net - a.net);
      }

      return {
        totalSpent,
        equalShare,
        budgetProgress,
        remainingBudget,
        memberBalances,
        simplifiedDebts
      };
    }
  };
});
