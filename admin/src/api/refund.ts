import request from '@/utils/request'
/**
 *
 * 退款售后管理
 *
 **/
// 退款申请分页查询接口
export const getRefundPage = (params: any) => {
  return request({
    url: '/refund/page',
    method: 'get',
    params
  })
}

// 处理退款申请接口（2同意 3拒绝）
export const handleRefund = (data: any) => {
  return request({
    url: '/refund/handle',
    method: 'put',
    data
  })
}
