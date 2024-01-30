// /**
//  * Validates an Arethusa file
//  * @template [T=HasNode]
//  */
// class Validator {

//     doc
//     /**
//      * 
//      * @param {T} doc 
//      */
//     constructor (doc) {
//         this.doc = doc
//     }

//     /**
//      * Validates the Arethusa file
//      * @abstract
//      * @returns {boolean} true if valid, false if invalid
//      */
//     validate() {    
        
//     }

//     /**
//      * Validates the Arethusa file
//      * @param {HasNode} arethusa 
//      * @returns {boolean} returns false if not valid
//      */
//     static validate(arethusa) {
//         try {
//             return ArethusaValidator.assertValid(arethusa)
//         } 
//         catch (e) {
//             if (e instanceof ValidationError) {
//                 return false
//             } 

//             throw e
//         }
//     }

//     /**
//      * Validates the Arethusa file
//      * @abstract
//      * @returns {boolean} true if valid, raises ValidationError if invalid
//      */
//     assertValid() {
        
//     }
// }