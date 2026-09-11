import request from '@/utils/request';
/**
 *
 * 优惠券管理
 *
 **/

// 优惠券活动分页查询接口
export const getCouponPage = (params: any) => {
  return request({
    url: '/coupon/page',
    method: 'get',
    params
  });
};

// 新增优惠券活动接口
export const addCoupon = (data: any) => {
  return request({
    url: '/coupon',
    method: 'post',
    data
  });
};

// 修改优惠券活动接口（含上下架）
export const editCoupon = (data: any) => {
  return request({
    url: '/coupon',
    method: 'put',
    data
  });
};

// 优惠券活动统计接口
export const getCouponStatistics = (id: any) => {
  return request({
    url: '/coupon/statistics',
    method: 'get',
    params: { id }
  });
};
