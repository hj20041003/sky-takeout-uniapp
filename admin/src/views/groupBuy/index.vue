<template>
  <div class="dashboard-container">
    <div class="container">
      <div class="tableBar">
        <span class="page-title">拼团活动管理</span>
        <el-button type="primary" @click="openAdd">+ 新增拼团</el-button>
      </div>

      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="dishName" label="拼团商品" />
        <el-table-column prop="groupPrice" label="拼团价(元)" width="110" />
        <el-table-column prop="requiredNum" label="成团人数" width="90" />
        <el-table-column label="活动时间" width="330">
          <template slot-scope="scope">
            {{ fmt(scope.row.startTime) }} ~ {{ fmt(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" type="success">进行中</el-tag>
            <el-tag v-else type="info">已下线</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="新增拼团活动" :visible.sync="dialogVisible" width="480px">
        <el-form label-width="90px">
          <el-form-item label="拼团商品">
            <el-select v-model="form.dishId" placeholder="选择商品" style="width: 100%">
              <el-option v-for="d in dishOptions" :key="d.id" :label="d.name" :value="d.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="拼团价(元)">
            <el-input v-model="form.groupPrice" placeholder="如 9.9" />
          </el-form-item>
          <el-form-item label="成团人数">
            <el-input v-model="form.requiredNum" placeholder="如 2" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker v-model="form.startTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker v-model="form.endTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width: 100%" />
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="save">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getGroupBuyList, addGroupBuy } from '@/api/groupBuy'
import { getDishPage } from '@/api/dish'

@Component({ name: 'groupBuy' })
export default class extends Vue {
  private list: any[] = []
  private dialogVisible = false
  private dishOptions: any[] = []
  private form: any = {
    dishId: '',
    groupPrice: '',
    requiredNum: 2,
    startTime: '',
    endTime: ''
  }

  created() {
    this.loadList()
  }

  private loadList() {
    getGroupBuyList().then((res: any) => {
      this.list = res.data.data || []
    })
  }

  private openAdd() {
    this.form = { dishId: '', groupPrice: '', requiredNum: 2, startTime: '', endTime: '' }
    if (!this.dishOptions.length) {
      getDishPage({ page: 1, pageSize: 100 }).then((res: any) => {
        this.dishOptions = (res.data.data && res.data.data.records) || []
      })
    }
    this.dialogVisible = true
  }

  private fmt(t: string) {
    return (t || '').slice(0, 16)
  }

  private save() {
    if (!this.form.dishId || this.form.groupPrice === '') {
      this.$message.error('请选择商品并填写拼团价')
      return
    }
    addGroupBuy({
      ...this.form,
      groupPrice: Number(this.form.groupPrice),
      requiredNum: Number(this.form.requiredNum) || 2
    }).then((res: any) => {
      if (res.data.code === 1) {
        this.$message.success('新增成功')
        this.dialogVisible = false
        this.loadList()
      } else {
        this.$message.error(res.data.msg || '新增失败')
      }
    })
  }
}
</script>

<style scoped>
.tableBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  font-size: 16px;
  font-weight: bold;
}
</style>
