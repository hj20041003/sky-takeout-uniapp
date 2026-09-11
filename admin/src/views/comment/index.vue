<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar"
           style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">评分：</label>
        <el-select v-model="score"
                   placeholder="请选择"
                   clearable
                   style="width: 15%"
                   @clear="init">
          <el-option v-for="n in [5, 4, 3, 2, 1]"
                     :key="n"
                     :label="n + '星'"
                     :value="n" />
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
        <el-table-column prop="userName"
                         label="用户"
                         width="140" />
        <el-table-column label="评分"
                         width="130">
          <template slot-scope="scope">
            <span class="score-star">{{ starText(scope.row.score) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content"
                         label="评价内容" />
        <el-table-column prop="reply"
                         label="商家回复">
          <template slot-scope="scope">
            <span :style="{ color: scope.row.reply ? '#333' : '#bbb' }">{{ scope.row.reply || '未回复' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime"
                         label="评价时间"
                         width="160" />
        <el-table-column label="操作"
                         width="100"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       class="blueBug"
                       @click="replyHandle(scope.row)">
              回复
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
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HeadLable from '@/components/HeadLable/index.vue'
import { getCommentPage, replyComment } from '@/api/comment'
import Empty from '@/components/Empty/index.vue'

@Component({
  name: 'Comment',
  components: {
    HeadLable,
    Empty
  }
})
export default class extends Vue {
  private score: number | null = null
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
    await getCommentPage({
      page: this.page,
      pageSize: this.pageSize,
      score: this.score ? this.score : undefined
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

  private starText(score: any) {
    return '★★★★★'.substring(0, Number(score) || 0)
  }

  // 回复评价
  private replyHandle(row: any) {
    this.$prompt('请输入商家回复内容', '回复评价 - 订单' + row.orderNumber, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: row.reply || '',
      inputValidator: (v: string) => {
        return v && v.trim() ? true : '回复内容不能为空'
      }
    }).then(({ value }: any) => {
      replyComment({ id: row.id, reply: value.trim() })
        .then(res => {
          if (String(res.data.code) === '1') {
            this.$message.success('回复成功！')
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

.score-star {
  color: #ffb400;
  letter-spacing: 2px;
}
</style>
