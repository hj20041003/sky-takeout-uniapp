<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar"
           style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">券名称：</label>
        <el-input v-model="name"
                  placeholder="请填写券名称"
                  style="width: 15%"
                  clearable
                  @clear="init"
                  @keyup.enter.native="init" />

        <label style="margin-right: 5px; margin-left: 20px">状态：</label>
        <el-select v-model="status"
                   placeholder="请选择"
                   clearable
                   style="width: 15%"
                   @clear="init">
          <el-option label="进行中"
                     :value="1" />
          <el-option label="已下架"
                     :value="2" />
        </el-select>

        <div style="float: right">
          <el-button type="primary"
                     class="continue"
                     @click="addHandle">
            + 新增优惠券
          </el-button>
        </div>

        <el-button class="normal-btn continue"
                   @click="init(true)">
          查询
        </el-button>
      </div>
      <el-table v-if="tableData.length"
                :data="tableData"
                stripe
                class="tableBox">
        <el-table-column prop="name"
                         label="券名称" />
        <el-table-column label="类型"
                         width="90">
          <template slot-scope="scope">
            <span>{{ typeText(scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="优惠内容">
          <template slot-scope="scope">
            <span>{{ discountText(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存(已领/总量)"
                         width="130">
          <template slot-scope="scope">
            <span>{{ scope.row.receivedCount || 0 }} / {{ scope.row.totalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="limitPerUser"
                         label="每人限领"
                         width="90" />
        <el-table-column label="状态"
                         width="90">
          <template slot-scope="scope">
            <div class="tableColumn-status"
                 :class="{ 'stop-use': String(scope.row.status) === '2' }">
              {{ String(scope.row.status) === '2' ? '已下架' : '进行中' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="领取时间"
                         width="300">
          <template slot-scope="scope">
            <span>{{ scope.row.receiveStartTime }} ~ {{ scope.row.receiveEndTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="使用时间"
                         width="300">
          <template slot-scope="scope">
            <span>{{ scope.row.useStartTime }} ~ {{ scope.row.useEndTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="220"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       class="blueBug"
                       @click="statisticsHandle(scope.row.id)">
              统计
            </el-button>
            <el-button type="text"
                       size="small"
                       class="blueBug"
                       @click="editHandle(scope.row)">
              修改
            </el-button>
            <el-button type="text"
                       size="small"
                       :class="String(scope.row.status) === '2' ? 'blueBug' : 'delBut'"
                       @click="statusHandle(scope.row)">
              {{ String(scope.row.status) === '2' ? '上架' : '下架' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Empty v-else
             :is-search="isSearch" />
      <el-pagination v-if="counts > 10"
                     class="pageList"
                     :page-sizes="[10, 20, 30, 40]"
                     :page-size="pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="counts"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange" />
    </div>

    <el-dialog :title="couponData.title"
               :visible.sync="couponData.dialogVisible"
               width="45%"
               :before-close="handleClose">
      <el-form ref="couponData"
               :model="couponData"
               class="demo-form-inline"
               :rules="rules"
               label-width="110px">
        <el-form-item label="券名称："
                      prop="name">
          <el-input v-model="couponData.name"
                    placeholder="如：满30减5券"
                    maxlength="30" />
        </el-form-item>
        <el-form-item label="券类型："
                      prop="type">
          <el-radio-group v-model="couponData.type"
                          @change="typeChange">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">折扣券</el-radio>
            <el-radio :label="3">无门槛券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="couponData.type === 1"
                      label="使用门槛(元)："
                      prop="thresholdAmount">
          <el-input v-model="couponData.thresholdAmount"
                    placeholder="订单满多少金额可用" />
        </el-form-item>
        <el-form-item :label="couponData.type === 2 ? '折扣率(%)：' : '优惠金额(元)：'"
                      prop="discountAmount">
          <el-input v-model="couponData.discountAmount"
                    :placeholder="couponData.type === 2 ? '如：90 表示 9 折' : '立减金额'" />
        </el-form-item>
        <el-form-item label="发行总量(张)："
                      prop="totalCount">
          <el-input v-model="couponData.totalCount"
                    placeholder="请输入发行总量" />
        </el-form-item>
        <el-form-item label="每人限领(张)："
                      prop="limitPerUser">
          <el-input v-model="couponData.limitPerUser"
                    placeholder="请输入每人限领数量" />
        </el-form-item>
        <el-form-item label="领取时间："
                      prop="receiveTime">
          <el-date-picker v-model="couponData.receiveStartTime"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="领取开始时间"
                          style="width: 46%" />
          <span style="margin: 0 6px">至</span>
          <el-date-picker v-model="couponData.receiveEndTime"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="领取截止时间"
                          style="width: 46%" />
        </el-form-item>
        <el-form-item label="使用时间："
                      prop="useTime">
          <el-date-picker v-model="couponData.useStartTime"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="使用开始时间"
                          style="width: 46%" />
          <span style="margin: 0 6px">至</span>
          <el-date-picker v-model="couponData.useEndTime"
                          type="datetime"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          placeholder="使用截止时间"
                          style="width: 46%" />
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button size="medium"
                   @click="couponData.dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   size="medium"
                   @click="submitForm()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="优惠券统计"
               :visible.sync="statisticsVisible"
               width="30%">
      <div v-if="statisticsData">
        <p class="stat-name">{{ statisticsData.name }}</p>
        <div class="stat-row">
          <span>发行总量：</span><span class="stat-num">{{ statisticsData.totalCount }} 张</span>
        </div>
        <div class="stat-row">
          <span>领取数量：</span><span class="stat-num">{{ statisticsData.receivedCount }} 张</span>
        </div>
        <div class="stat-row">
          <span>核销数量：</span><span class="stat-num">{{ statisticsData.usedCount }} 张</span>
        </div>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button size="medium"
                   @click="statisticsVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HeadLable from '@/components/HeadLable/index.vue'
import {
  getCouponPage,
  addCoupon,
  editCoupon,
  getCouponStatistics
} from '@/api/coupon'
import Empty from '@/components/Empty/index.vue'

@Component({
  name: 'Coupon',
  components: {
    HeadLable,
    Empty
  }
})
export default class extends Vue {
  private action: string = ''
  private name: string = ''
  private status: number | null = null
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private tableData = []
  private isSearch: boolean = false
  private statisticsVisible: boolean = false
  private statisticsData: any = null
  private couponData: any = {
    title: '新增优惠券',
    dialogVisible: false,
    id: '',
    name: '',
    type: 1,
    thresholdAmount: '',
    discountAmount: '',
    totalCount: '',
    limitPerUser: '',
    receiveStartTime: '',
    receiveEndTime: '',
    useStartTime: '',
    useEndTime: ''
  }

  get rules() {
    return {
      name: [
        {
          required: true,
          trigger: 'blur',
          validator: (rule: any, value: string, callback: Function) => {
            if (!value) {
              callback(new Error('券名称不能为空'))
            } else {
              callback()
            }
          }
        }
      ],
      type: [
        {
          required: true,
          trigger: 'change',
          validator: (rule: any, value: number, callback: Function) => {
            if (!value) {
              callback(new Error('请选择券类型'))
            } else {
              callback()
            }
          }
        }
      ],
      thresholdAmount: [
        {
          required: true,
          trigger: 'blur',
          validator: (rule: any, value: string, callback: Function) => {
            if (this.couponData.type !== 1) {
              callback()
            } else if (!value) {
              callback(new Error('使用门槛不能为空'))
            } else if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) <= 0) {
              callback(new Error('请输入正确的金额'))
            } else {
              callback()
            }
          }
        }
      ],
      discountAmount: [
        {
          required: true,
          trigger: 'blur',
          validator: (rule: any, value: string, callback: Function) => {
            if (!value) {
              callback(new Error(this.couponData.type === 2 ? '折扣率不能为空' : '优惠金额不能为空'))
            } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
              callback(new Error('请输入正确的数字'))
            } else if (this.couponData.type === 2 && (Number(value) <= 0 || Number(value) >= 100)) {
              callback(new Error('折扣率应为1-99之间的数字'))
            } else {
              callback()
            }
          }
        }
      ],
      totalCount: [
        {
          required: true,
          trigger: 'blur',
          validator: (rule: any, value: string, callback: Function) => {
            if (!value) {
              callback(new Error('发行总量不能为空'))
            } else if (!/^[1-9]\d*$/.test(value)) {
              callback(new Error('请输入正整数'))
            } else {
              callback()
            }
          }
        }
      ],
      limitPerUser: [
        {
          required: true,
          trigger: 'blur',
          validator: (rule: any, value: string, callback: Function) => {
            if (!value) {
              callback(new Error('每人限领数量不能为空'))
            } else if (!/^[1-9]\d*$/.test(value)) {
              callback(new Error('请输入正整数'))
            } else {
              callback()
            }
          }
        }
      ],
      receiveTime: [
        {
          required: true,
          trigger: 'change',
          validator: (rule: any, value: string, callback: Function) => {
            if (!this.couponData.receiveStartTime || !this.couponData.receiveEndTime) {
              callback(new Error('请选择领取起止时间'))
            } else {
              callback()
            }
          }
        }
      ],
      useTime: [
        {
          required: true,
          trigger: 'change',
          validator: (rule: any, value: string, callback: Function) => {
            if (!this.couponData.useStartTime || !this.couponData.useEndTime) {
              callback(new Error('请选择使用起止时间'))
            } else {
              callback()
            }
          }
        }
      ]
    }
  }

  created() {
    this.init()
  }

  // 初始化信息
  private async init(isSearch?) {
    this.isSearch = isSearch
    await getCouponPage({
      page: this.page,
      pageSize: this.pageSize,
      name: this.name ? this.name : undefined,
      status: this.status ? this.status : undefined
    })
      .then(res => {
        if (String(res.data.code) === '1') {
          this.tableData =
            res && res.data && res.data.data && res.data.data.records
          this.counts = Number(res.data.data.total)
        } else {
          this.$message.error(res.data.desc || res.data.msg)
        }
      })
      .catch(err => {
        this.$message.error('请求出错了：' + err.message)
      })
  }

  private typeText(type: any) {
    return type === 1 ? '满减券' : type === 2 ? '折扣券' : '无门槛券'
  }

  private discountText(row: any) {
    if (row.type === 1) {
      return '满' + row.thresholdAmount + '减' + row.discountAmount + '元'
    }
    if (row.type === 2) {
      return (Number(row.discountAmount) / 10) + '折'
    }
    return '立减' + row.discountAmount + '元'
  }

  private typeChange() {
    if (this.$refs.couponData) {
      (this.$refs.couponData as any).clearValidate('thresholdAmount')
      ;(this.$refs.couponData as any).clearValidate('discountAmount')
    }
  }

  // 新增
  private addHandle() {
    this.couponData.title = '新增优惠券'
    this.action = 'add'
    this.couponData.id = ''
    this.couponData.name = ''
    this.couponData.type = 1
    this.couponData.thresholdAmount = ''
    this.couponData.discountAmount = ''
    this.couponData.totalCount = ''
    this.couponData.limitPerUser = ''
    this.couponData.receiveStartTime = ''
    this.couponData.receiveEndTime = ''
    this.couponData.useStartTime = ''
    this.couponData.useEndTime = ''
    this.couponData.dialogVisible = true
  }

  // 修改
  private editHandle(dat: any) {
    this.couponData.title = '修改优惠券'
    this.action = 'edit'
    this.couponData.id = dat.id
    this.couponData.name = dat.name
    this.couponData.type = dat.type
    this.couponData.thresholdAmount = dat.thresholdAmount
    this.couponData.discountAmount = dat.discountAmount
    this.couponData.totalCount = dat.totalCount
    this.couponData.limitPerUser = dat.limitPerUser
    // 后端返回 yyyy-MM-dd HH:mm，补秒以匹配 yyyy-MM-dd HH:mm:ss 解析
    this.couponData.receiveStartTime = this.fixTime(dat.receiveStartTime)
    this.couponData.receiveEndTime = this.fixTime(dat.receiveEndTime)
    this.couponData.useStartTime = this.fixTime(dat.useStartTime)
    this.couponData.useEndTime = this.fixTime(dat.useEndTime)
    this.couponData.dialogVisible = true
  }

  private fixTime(t: string) {
    return t && t.length === 16 ? t + ':00' : t || ''
  }

  // 关闭弹窗
  private handleClose() {
    this.couponData.dialogVisible = false
  }

  // 状态修改（上下架）
  private statusHandle(row: any) {
    const toStatus = String(row.status) === '2' ? 1 : 2
    const tip = toStatus === 2 ? '下架后用户端将不可领取与使用' : '确认重新上架该优惠券？'
    this.$confirm(tip, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'customClass'
    }).then(() => {
      editCoupon({ id: row.id, status: toStatus })
        .then(res => {
          if (String(res.data.code) === '1') {
            this.$message.success('状态修改成功！')
            this.init()
          } else {
            this.$message.error(res.data.desc || res.data.msg)
          }
        })
        .catch(err => {
          this.$message.error('请求出错了：' + err.message)
        })
    })
  }

  // 统计
  private statisticsHandle(id: any) {
    getCouponStatistics(id)
      .then(res => {
        if (String(res.data.code) === '1') {
          this.statisticsData = res.data.data
          this.statisticsVisible = true
        } else {
          this.$message.error(res.data.desc || res.data.msg)
        }
      })
      .catch(err => {
        this.$message.error('请求出错了：' + err.message)
      })
  }

  $refs!: {
    couponData: any
  }

  // 数据提交
  submitForm() {
    this.$refs.couponData.validate((value: boolean) => {
      if (value) {
        const params: any = {
          name: this.couponData.name,
          type: this.couponData.type,
          discountAmount: this.couponData.discountAmount,
          totalCount: this.couponData.totalCount,
          limitPerUser: this.couponData.limitPerUser,
          receiveStartTime: this.couponData.receiveStartTime,
          receiveEndTime: this.couponData.receiveEndTime,
          useStartTime: this.couponData.useStartTime,
          useEndTime: this.couponData.useEndTime
        }
        if (this.couponData.type === 1) {
          params.thresholdAmount = this.couponData.thresholdAmount
        }
        if (this.action === 'add') {
          addCoupon(params)
            .then(res => {
              if (String(res.data.code) === '1') {
                this.$message.success('优惠券添加成功！')
                this.couponData.dialogVisible = false
                this.$refs.couponData.resetFields()
                this.init()
              } else {
                this.$message.error(res.data.desc || res.data.msg)
              }
            })
            .catch(err => {
              this.$message.error('请求出错了：' + err.message)
            })
        } else {
          params.id = this.couponData.id
          editCoupon(params)
            .then(res => {
              if (String(res.data.code) === '1') {
                this.$message.success('优惠券修改成功！')
                this.couponData.dialogVisible = false
                this.$refs.couponData.resetFields()
                this.init()
              } else {
                this.$message.error(res.data.desc || res.data.msg)
              }
            })
            .catch(err => {
              this.$message.error('请求出错了：' + err.message)
            })
        }
      }
    })
  }

  // 分页
  private handleSizeChange(val: any) {
    this.pageSize = val
    this.init()
  }

  private handleCurrentChange(val: any) {
    this.page = val
    this.init()
  }
}
</script>
<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;

    .container {
      background: #fff;
      position: relative;
      z-index: 1;
      padding: 30px 28px;
      border-radius: 4px;

      .tableBar {
        display: flex;
        margin-bottom: 20px;
        justify-content: space-between;
      }

      .tableBox {
        width: 100%;
        border: 1px solid $gray-5;
        border-bottom: 0;
      }

      .pageList {
        text-align: center;
        margin-top: 30px;
      }
      //查询黑色按钮样式
      .normal-btn {
        background: #333333;
        color: white;
        margin-left: 20px;
      }
    }
  }
}

.stat-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.stat-row {
  font-size: 15px;
  color: #666;
  line-height: 34px;
}

.stat-num {
  color: #e95f3c;
  font-weight: bold;
}
</style>
