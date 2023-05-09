export class ObjectDefinition<M, U>{
    compound?: U;
    shapes?: {
        id: string,
        shape: U
    }[];
    data?: M;
}
