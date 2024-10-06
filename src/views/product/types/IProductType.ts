import type IFileModel from "@/commons/types/IFileModel"
import type ICategoryType from "./ICategoryType"
import type IBrandType from "./IBrandType"

export default interface IProductType {
    id: number
    name: string
    productNumber: string
    category: number | undefined
    brand: number | undefined
    isWebDisplay: boolean
    sex: 'MALE' | 'FEMALE' | 'BOTH'
    newPrice: number
    oldPrice: number
    mainImage: number | undefined
    bgImages: number[] | undefined
    desc: string 
    loaiBienThe?: EProductVariation,
    chatLieu: string;
    trongLuong: string;
    congNghe: string;
    tinhNang: string;
    noiSanXuat: string;
};

export interface IProductTypeReq {
    id?: number
    tieuDe: string
    maSP: string
    dmGiay: {
        id: number
    }
    thuongHieu: {
        id: number
    }
    hienThiWeb: boolean
    gioiTinh: 'MALE' | 'FEMALE' | 'BOTH'
    giaMoi: number
    giaCu: number
    anhChinh: number
    anhPhu: number[]
    moTa: string
    chatLieu: string;
    trongLuong: string;
    congNghe: string;
    tinhNang: string;
    noiSanXuat: string;
};
export interface IProductTypeRes {
    stt?: number
    id: number
    tieuDe: string
    maSP: string
    dmGiay: ICategoryType
    thuongHieu: IBrandType
    hienThiWeb: boolean
    gioiTinh: 'MALE' | 'FEMALE' | 'BOTH'
    giaMoi: number
    giaCu: number
    anhChinh: IFileModel
    anhPhu: IFileModel[]
    moTa: string
    nguoiTao: number
    ngayTao: Date
    loaiBienThe?: EProductVariation
    chatLieu: string;
    trongLuong: string;
    congNghe: string;
    tinhNang: string;
    noiSanXuat: string;
};


export interface IProductVariationReqType {
    id?: number
    sanPham: number
    bienThe1?: number
    bienThe2?: number
    bienTheGiaTri1?: number
    bienTheGiaTri2?: number
    anh: number
}

export interface IProductVariationType {
    id: number
    productId: number
    variationId1: number
    variationValId1: string
    variationId2: number
    variationValId2: string
    image: number
    stockCnt: number
    deleteAt: Date
};

export interface IProductVariation{
    stt: number,
    id?: number,
    bienThe1?: number,
    giatri1?: number,
    bienThe2?: number,
    giatri2?: number,
    anh?: IFileModel,
    soLuong?: number,
    giaTriObj1?: IProductVariationValType;
    giaTriObj2?: IProductVariationValType;
    motaPhanLoai: string;
};

export interface IProductVariationValType{
    id: number;
    giaTri: string;
}

export type EProductVariation = "COLOR" |"SIZE" | "BOTH";

export interface IProductStockType{
    stt: number,
    id: number,
    isEdit: boolean,
    remainQuantity: number,
    anh?: string
}


export interface IProductFilterReq{
  q?: string;
  tieuDe?: string;
  tinhTrangKho?: 'AVAIL' | 'EMPTY';
  maSp?: string;
  dmGiay?: number;
  thuongHieu?: number;
  hienThiWeb?: boolean;
  createdAtRange?: any;
}