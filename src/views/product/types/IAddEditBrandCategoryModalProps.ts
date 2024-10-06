import type ICategoryType from "./ICategoryType";

export default interface IAddEditBrandCategoryModalProps{
    title: string,
    visible: boolean,
    value?: { //use for edit
        id: number,
        name: string
    },
    onSubmitOK: (val: string)=>void,
    onCancel: Function
}

