import request from '@/utils/request'
/**
 *
 * 订单评价管理
 *
 **/
// 评价分页查询接口
export const getCommentPage = (params: any) => {
  return request({
    url: '/comment/page',
    method: 'get',
    params
  })
}

// 回复评价接口
export const replyComment = (params: any) => {
  return request({
    url: '/comment/reply',
    method: 'put',
    params
  })
}
