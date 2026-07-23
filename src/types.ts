/** 单个图片项的状态数据 */
export interface ImageItem {
  /** 内部唯一 id */
  id: string
  /** 原始 File 对象 */
  file: File
  /** 缩略图 data URL */
  thumbnail: string
  /** 文件名 */
  name: string
  /** 文件大小（字节） */
  size: number
  /** 图片 MIME 类型 */
  type: string
  /** 上传时间戳 */
  createdAt: number
}
