<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar"
           style="display: inline-block; width: 100%">
        <label style="margin-right: 10px">操作时间：</label>
        <el-date-picker v-model="operateTimeBegin"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        default-time="00:00:00"
                        placeholder="开始时间"
                        style="width: 18%"
                        @change="init" />
        <span style="margin: 0 6px">至</span>
        <el-date-picker v-model="operateTimeEnd"
                        type="datetime"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        default-time="23:59:59"
                        placeholder="结束时间"
                        style="width: 18%"
                        @change="init" />

        <el-button class="normal-btn continue"
                   style="margin-left: 20px"
                   @click="init(true)">
          查询
        </el-button>
      </div>
      <el-table v-if="tableData.length"
                :data="tableData"
                stripe
                class="tableBox">
        <el-table-column prop="operateName"
                         label="操作人"
                         width="100" />
        <el-table-column prop="description"
                         label="操作描述"
                         min-width="120" />
        <el-table-column label="操作位置"
                         min-width="220">
          <template slot-scope="scope">
            <span>{{ scope.row.className }}.{{ scope.row.methodName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="requestMethod"
                         label="请求方式"
                         width="90" />
        <el-table-column prop="requestUrl"
                         label="请求路径"
                         min-width="160" />
        <el-table-column label="执行状态"
                         width="90">
          <template slot-scope="scope">
            <div :class="String(scope.row.operateStatus) === '1' ? 'log-success' : 'log-fail'">
              {{ String(scope.row.operateStatus) === '1' ? '成功' : '失败' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="耗时"
                         width="90">
          <template slot-scope="scope">
            <span>{{ scope.row.costTime }} ms</span>
          </template>
        </el-table-column>
        <el-table-column prop="operateTime"
                         label="操作时间"
                         width="140" />
        <el-table-column label="操作"
                         width="80"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       size="small"
                       class="blueBug"
                       @click="detailHandle(scope.row)">
              详情
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

    <el-dialog title="操作日志详情"
               :visible.sync="detailVisible"
               width="45%">
      <div v-if="detailData" class="detail-box">
        <p class="detail-item"><span class="detail-label">操作人：</span>{{ detailData.operateName }}（ID: {{ detailData.operateUser }}）</p>
        <p class="detail-item"><span class="detail-label">操作描述：</span>{{ detailData.description }}</p>
        <p class="detail-item"><span class="detail-label">操作位置：</span>{{ detailData.className }}.{{ detailData.methodName }}</p>
        <p class="detail-item"><span class="detail-label">请求方式：</span>{{ detailData.requestMethod }}　<span class="detail-label">请求路径：</span>{{ detailData.requestUrl }}</p>
        <p class="detail-item"><span class="detail-label">操作IP：</span>{{ detailData.operateIp }}　<span class="detail-label">耗时：</span>{{ detailData.costTime }} ms　<span class="detail-label">操作时间：</span>{{ detailData.operateTime }}</p>
        <p class="detail-item"><span class="detail-label">请求参数：</span></p>
        <pre class="detail-json">{{ pretty(detailData.requestParams) }}</pre>
        <p class="detail-item"><span class="detail-label">返回结果：</span></p>
        <pre class="detail-json">{{ pretty(detailData.responseResult) }}</pre>
        <template v-if="String(detailData.operateStatus) !== '1'">
          <p class="detail-item"><span class="detail-label">异常信息：</span></p>
          <pre class="detail-json detail-error">{{ detailData.errorMsg }}</pre>
        </template>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button size="medium"
                   @click="detailVisible = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HeadLable from '@/components/HeadLable/index.vue'
import { getOperateLogPage } from '@/api/operateLog'
import Empty from '@/components/Empty/index.vue'

@Component({
  name: 'OperateLog',
  components: {
    HeadLable,
    Empty
  }
})
export default class extends Vue {
  private operateTimeBegin: string = ''
  private operateTimeEnd: string = ''
  private counts: number = 0
  private page: number = 1
  private pageSize: number = 10
  private tableData = []
  private isSearch: boolean = false
  private detailVisible: boolean = false
  private detailData: any = null

  created() {
    this.init()
  }

  // 初始化信息
  private async init(isSearch?) {
    this.isSearch = isSearch
    await getOperateLogPage({
      page: this.page,
      pageSize: this.pageSize,
      operateTimeBegin: this.operateTimeBegin ? this.operateTimeBegin : undefined,
      operateTimeEnd: this.operateTimeEnd ? this.operateTimeEnd : undefined
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

  private pretty(jsonStr: string) {
    if (!jsonStr) return '—'
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2)
    } catch (e) {
      return jsonStr
    }
  }

  private detailHandle(row: any) {
    this.detailData = row
    this.detailVisible = true
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
        align-items: center;
        margin-bottom: 20px;
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

.log-success {
  color: #67c23a;
}

.log-fail {
  color: #f56c6c;
}

.detail-box {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-item {
  font-size: 14px;
  color: #333;
  line-height: 26px;
  margin: 0 0 6px;
}

.detail-label {
  color: #999;
}

.detail-json {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  color: #333;
  max-height: 180px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0 0 10px;
}

.detail-error {
  color: #f56c6c;
}
</style>
