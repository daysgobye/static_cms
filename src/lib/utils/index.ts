import type { AstroGlobal } from "astro"
import type { AstroComponentFactory } from "astro/runtime/server/index.js"

type AstroType = Readonly<AstroGlobal<Record<string, any>, AstroComponentFactory, Record<string, string | undefined>>>

export const makeUrlSafe = (str: string) => {
    return str.replaceAll("/", "<bs>").replaceAll(".", "<dot>").replaceAll(" ", "<spc>")
}
export const makeUrlUnSafe = (str: string) => {
    return str.replaceAll("<bs>", "/").replaceAll("<dot>", ".").replaceAll("<spc>", " ")
}

export const getParam = (name: string, Astro: AstroType) => {
    const rawFile = Astro.url.searchParams.get(name);
    if (rawFile) {
        return makeUrlUnSafe(rawFile)
    }
    else {
        return undefined
    }
}

export const getFileParam = (Astro: AstroType) => {
    return getParam("file", Astro)
}
export const getSelectedPathParam = (Astro: AstroType) => {
    return getParam("selectedpath", Astro)
}
export const getPathParam = (Astro: AstroType): string[] => {
    const raw = Astro.url.searchParams.getAll("path");

    if (raw) {
        return raw
    }
    else {
        return []
    }
}



export const toBinary = (str: string) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

export const fromBinary = (str: string) => {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
}
export const getCurrentUrl = (Astro: AstroType, paramToAdd?: { key: string, value: string }): string => {
    const { url } = Astro.request; // Get the current URL from the Astro request
    const currentUrl = new URL(url); // Create a URL object for easy manipulation

    if (paramToAdd) {
        // Add or update the query parameter
        currentUrl.searchParams.set(paramToAdd.key, paramToAdd.value);
    }

    return currentUrl.toString(); // Return the updated URL as a string
};