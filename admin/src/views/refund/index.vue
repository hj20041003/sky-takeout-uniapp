<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar"
           style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">处理状态：</label>
        <el-select v-model="status"
                   placeholder="请选择"
                   clearable
                   style="width: 15%"
                   @clear="init">
          <el-option label="待处理"
                     :value="1" />
          <el-option label="已同意"
                     :value="2" />
          <el-option label="已拒绝"
                     :value="3" />
        </el-select>

        <el-button class="normal-btn continue"
                   @click="init(true)">
          查询
        </el-button>
      </div>
      <el-table v-if="tableData.length"
                :data="tableData"
                stripe
                class="tableBox">
        <el-table-column prop="orderNumber"
                         label="订单号"
                         width="200" />
        <el-table-column label="订单金额"
                         width="110">
          <template slot-scope="scope">
            <span>￥{{ scope.row.orderAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="退款金额"
                         width="110">
          <template slot-scope="scope">
            <span style="color: #e95f3c">￥{{ scope.row.refundAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason"
                         label="申请原因" />
        <el-table-column label="状态"
                         width="100">
          <template slot-scope="scope">
            <div class="tableColumn-status"
                 :class="{ 'stop-use': scope.row.status === 3 }">
              {{ statusText(scope.row.status) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime"
                         label="申请时间"
                         width="160" />
        <el-table-column prop="handleTime"
                         label="处理时间"
                         width="160" />
        <el-table-column prop="adminRemark"
                         label="商家备注" />
        <el-table-column label="操作"
                         width="160"
                         align="center">
          <template slot-scope="scope">
            <template v-if="scope.row.status === 1">
              <el-button type="text"
                         size="small"
                         class="blueBug"
                         @click="handleApply(scope.row, 2)">
                同意
              </el-button>
              <el-button type="text"
                         size="small"
                         class="delBut"
                         @click="handleApply(scope.row, 3)">
                拒绝
              </el-button>
            </template>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HeadLable from '@/components/HeadLable/index.vue'
import { getRefundPage, handleRefund } from '@/api/refund'
import Empty from '@/components/Empty/index.vue'

@Component({
  name: 'Refund',
  components: {
    HeadLable,
    Empty
  }
})
export default class extends Vue {
  private status: number | null = null
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private tableData = []
  private isSearch: boolean = false

  created() {
    this.init()
  }

  // 初始化信息
  private async init(isSearch?) {
    this.isSearch = isSearch
    await getRefundPage({
      page: this.page,
      pageSize: this.pageSize,
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

  private statusText(status: any) {
    return status === 1 ? '待处理' : status === 2 ? '已同意' : '已拒绝'
  }

  // 处理退款申请（2同意 3拒绝）
  private handleApply(row: any, status: number) {
    const tip =
      status === 2
        ? '同意后将按原路退款并恢复库存，请输入商家备注'
        : '拒绝该退款申请，请输入商家备注'
    this.$prompt(tip, status === 2 ? '同意退款' : '拒绝退款', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: status === 2 ? '同意退款' : '不符合退款条件',
      inputValidator: (v: string) => {
        return v && v.trim() ? true : '备注不能为空'
      }
    }).then(({ value }: any) => {
      handleRefund({ id: row.id, status: status, adminRemark: value.trim() })
        .then(res => {
          if (String(res.data.code) === '1') {
            this.$message.success('处理成功！')
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
</style>
