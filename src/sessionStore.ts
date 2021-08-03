/* abstract */ 
class SessionStore {
    findSession(id: any) {}
    saveSession(id: any, session: any) {}
    findAllSessions() {}
}

export class InMemorySessionStore extends SessionStore {
    sessions: any
    constructor() {
        super();
        this.sessions = new Map();
    }

    findSession(id: any) {
        return this.sessions.get(id);
    }

    saveSession(id: any, session: any) {
        this.sessions.set(id, session);
    }

    findAllSessions() {
        return [...this.sessions.values()];
    }
}
  
const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userID, connected]: any) =>
userID ? { userID, connected: connected === "true" } : undefined;

export class RedisSessionStore extends SessionStore {
    redisClient: any
    constructor(redisClient: any) {
        super();
        this.redisClient = redisClient;
    }

    findSession(id: any) {
        return this.redisClient
        .hmget(`session:${id}`, "userID", "connected")
        .then(mapSession);
    }

    saveSession(id: any, { userID, connected }: any) {
        this.redisClient
        .multi()
        .hset(
            `session:${id}`,
            "userID",
            userID,
            "connected",
            connected
        )
        .expire(`session:${id}`, SESSION_TTL)
        .exec();
    }

    async findAllSessions() {
        const keys = new Set();
        let nextIndex = 0;
        do {
            const [nextIndexAsStr, results] = await this.redisClient.scan(
                nextIndex,
                "MATCH",
                "session:*",
                "COUNT",
                "100"
            );
            nextIndex = parseInt(nextIndexAsStr, 10);

            results.forEach((s: any) => keys.add(s));
        } while (nextIndex !== 0);


        const commands: any = [];
        keys.forEach((key) => {
            commands.push(["hmget", key, "userID", "connected"]);
        });

        return this.redisClient
            .multi(commands)
            .exec()
            .then((results: any) => {
                return results
                .map(([err, session]: any) => (err ? undefined : mapSession(session)))
                .filter((v: any) => !!v);
            });
    }
}