namespace Obj {

    export const deepcopy = <T extends object>(obj: T): T => {
        return JSON.parse(JSON.stringify(obj))
    }
}