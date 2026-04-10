export type User = {
    id: string;
    phone: string;
    name: string;
    about: string;
    avatar?: string | null;
    isOnline: boolean;
    lastSeen?: string | null;
    createdAt: string;
    updatedAt: string;
};
