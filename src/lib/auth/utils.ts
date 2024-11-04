import { runtime } from "std-env";
import { verify, hash } from "@node-rs/argon2";

export const isValidEmail = (email: string): boolean => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
};

const workerHashPassword = async (
    password: string,
    providedSalt?: Uint8Array
): Promise<string> => {
    const encoder = new TextEncoder();
    // Use provided salt if available, otherwise generate a new one
    const salt = providedSalt || crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    const exportedKey = (await crypto.subtle.exportKey(
        "raw",
        key
    )) as ArrayBuffer;
    const hashBuffer = new Uint8Array(exportedKey);
    const hashArray = Array.from(hashBuffer);
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const saltHex = Array.from(salt)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return `${saltHex}:${hashHex}`;
}

const workerVerifyPassword = async (
    storedHash: string,
    passwordAttempt: string
): Promise<boolean> => {
    const [saltHex, originalHash] = storedHash.split(":");
    const matchResult = saltHex.match(/.{1,2}/g);
    if (!matchResult) {
        throw new Error("Invalid salt format");
    }
    const salt = new Uint8Array(matchResult.map((byte) => parseInt(byte, 16)));
    const attemptHashWithSalt = await workerHashPassword(passwordAttempt, salt);
    const [, attemptHash] = attemptHashWithSalt.split(":");
    return attemptHash === originalHash;
}


export const getHashPassword = (): (
    password: string,
) => Promise<string> => {
    switch (runtime) {
        case "bun":
            return Bun.password.hash
        case "node":
            return async (password: string) => hash(password, {
                // recommended minimum parameters
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1
            })
        default:
            return workerHashPassword
    }
}
export const getVerifyPassword = (): (
    storedHash: string,
    passwordAttempt: string,
) => Promise<boolean> => {
    switch (runtime) {
        case "bun":
            return Bun.password.verify
        case "node":
            return async (storedHash: string, password: string) => verify(storedHash, password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1
            })
        default:
            return workerVerifyPassword
    }
}