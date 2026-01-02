import { customAlphabet } from 'nanoid';

// Create a custom nanoid with URL-safe characters (no special chars)
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);

export const generatePasteId = (): string => {
    return nanoid();
};
