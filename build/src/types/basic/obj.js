var Obj;
(function (Obj) {
    Obj.deepcopy = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };
})(Obj || (Obj = {}));
