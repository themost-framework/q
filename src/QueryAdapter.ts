// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
export type QueryAdapterExecuteCallback = ( error?: any, result?: any ) => void;

export type TransactionFunctionCallback =( error?: any ) => void;

export type TransactionFunction = () => Promise<any>;

export interface QueryAdapter {
    open(callback: QueryAdapterExecuteCallback): void;
    close(callback: QueryAdapterExecuteCallback): void;
    executeInTransaction(transactionFunc: TransactionFunctionCallback, callback: QueryAdapterExecuteCallback): void;
    execute(query: any, values: any[], callback: QueryAdapterExecuteCallback): void;
    selectIdentity(entity: string, attribute: string, callback: QueryAdapterExecuteCallback): void;
}

export interface AsyncQueryAdapter {
    openAsync(): Promise<void>;
    closeAsync(): Promise<void>;
    executeInTransactionAsync(transactionFunc: TransactionFunction): Promise<void>;
    selectIdentityAsync(entity: string, attribute: string): Promise<any>;
    executeAsync(query: any, values?: any[]): Promise<any>;
}

export interface QueryAdapterLastIdentity {
    lastIdentity(callback: QueryAdapterExecuteCallback): void;
}

export interface AsyncQueryAdapterLastIdentity {
    lastIdentityAsync(): Promise<any>;
}
