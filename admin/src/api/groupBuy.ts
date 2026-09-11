import request from '@/utils/request'
/**
 *
 * 拼团活动管理（社区生鲜）
 *
 **/
// 查询全部拼团活动
export const getGroupBuyList = () => {
  return request({
    url: '/groupBuy/list',
    method: 'get'
  })
}

// 新增拼团活动
export const addGroupBuy = (params: any) => {
  return request({
    url: '/groupBuy',
    method: 'post',
    data: { ...params }
  })
}
