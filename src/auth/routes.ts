import { Elysia, t } from "elysia";
import { generateId } from "lucia";
import { getAuthUser, insertAuthUser } from "../../db/db";
import { lucia } from "./index";


export const authApp = new Elysia();
authApp.group('/auth', (app) => 
    app
        .post('/signup', async ({ body, set}) => {
            const { email, password } = body;
            const hashedPassword = await Bun.password.hash(password);
            const userId = generateId(15);

            try {
                await insertAuthUser({ id: userId, email, hashedPassword })

                const session = await lucia.createSession(userId, {});
                set.status = 302;
                return { message: 'success', token: session.id }
            } catch {
                // db error, email taken, etc
                set.status = 400;
                return { error: 'Email already used' }
            }
        }, {
            body: t.Object({
                email: t.String({
                    format: 'email',
                    error: 'Invalid email'
                }),
                password: t.String({
                    minLength: 6,
                    error: 'Invalid password'
                })
            })
        })

        .post('/signin', async ({ body, set}) => {
            const { email, password } = body;
            const user = await getAuthUser(email);
            if (user) {
                const isValidPassword = await Bun.password.verify(password, user.hashedPassword || '');
                if (isValidPassword) {
                    const session = await lucia.createSession(user.id, {});
                    set.status = 302;
                    return { message: 'success', token: session.id }
                }    
            }
            set.status = 400;
            return { error: 'Invalid email or password' }
        }, {
            body: t.Object({
                email: t.String({
                    format: 'email'
                }),
                password: t.String()
            }, {
                error: 'Invalid email or password'
            })
        })
);