import { lucia } from ".";

export const validateAuthHeader = async (headers: Record<string, string | undefined>): Promise<boolean> => {
    const sessionId = lucia.readBearerToken(headers['authorization'] || '');
    const { session } = await lucia.validateSession(sessionId || '');
    return session !== null;
}

export const validateAuthToken = async (token: string): Promise<boolean> => {
	const { session } = await lucia.validateSession(token);
	return session !== null;
}