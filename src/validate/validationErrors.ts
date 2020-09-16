type EnumLiteralsOf<T extends object> = T[keyof T];

export type ValidationError = EnumLiteralsOf<typeof ValidationError>;

export const ValidationError = Object.freeze({
    None: -1 as -1,
    UndefinedInputs: 1 as 1,
    Keys: 2 as 2,
    Types: 3 as 3,
    NotEnough: 4 as 4,
    Username: 100 as 100,
    RoomMovement: 200 as 200,
    RoomFull: 201 as 201,
    AgentOwnership: 300 as 300,
    AgentConversationNotShared: 301 as 301,
    AgentRoomNotShared: 302 as 302,
    AgentAlreadyInCovnersation: 303 as 303,
    AgentIdentical: 304 as 304,
    AgentLackingGold: 305 as 305,
    ItemInTransaction: 400 as 400,
    ConversationInDifferentRoom: 500 as 500,
    ConversationFull: 501 as 501,
    ConversationMissingAgent: 502 as 502,
});