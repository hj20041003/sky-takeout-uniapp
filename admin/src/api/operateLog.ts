import request from '@/utils/request';
/**
 *
 * 操作日志管理
 *
 **/

// 操作日志分页查询接口
export const getOperateLogPage = (params: any) => {
  return request({
    url: '/operateLog/page',
    method: 'get',
    params
  });
};
