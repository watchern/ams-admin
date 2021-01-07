<template>
  <div class="list-model zookeeper-list">
    <div class="table-box">
      <table>
        <tr>
          <th>
            <span>编号</span>
          </th>
          <th>
            <span>host</span>
          </th>
          <th>
            <span>连接数</span>
          </th>
          <th>
            <span>watches 数量</span>
          </th>
          <th>
            <span>发送量</span>
          </th>
          <th>
            <span>接收量</span>
          </th>
          <th>
            <span>leader/follower</span>
          </th>
          <th>
            <span>最低延时</span>
          </th>
          <th>
            <span>平均延时</span>
          </th>
          <th>
            <span>最大延时</span>
          </th>
          <th>
            <span>节点数</span>
          </th>
          <th>
            <span>当前查询时间</span>
          </th>
          <th style="text-align: center">
            <span>节点自检状态</span>
          </th>
        </tr>
        <tr v-for="(item, $index) in list" :key="$index">
          <td>
            <span>{{ $index + 1 }}</span>
          </td>
          <td>
            <span>
              {{ item.hostname }}
            </span>
          </td>
          <td><span>{{ item.connections }}</span></td>
          <td>
            <span>{{ item.watches }}</span>
          </td>
          <td>
            <span>{{ item.sent }}</span>
          </td>
          <td>
            <span>{{ item.received }}</span>
          </td>
          <td><span>{{ item.mode }}</span></td>
          <td>
            <span>{{ item.minLatency }}</span>
          </td>
          <td>
            <span>{{ item.avgLatency }}</span>
          </td>
          <td>
            <span>{{ item.maxLatency }}</span>
          </td>
          <td>
            <span>{{ item.nodeCount }}</span>
          </td>
          <td>
            <span v-if="item.date">{{ item.date | formatDate }}</span>
            <span v-else>-</span>
          </td>
          <td>
            <span class="state">
              <em v-if="item.state" class="ans-icon-success-solid success" />
              <em v-else class="ans-icon-fail-solid error" />
            </span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs'
export default {
  name: 'ZookeeperList',
  filters: {
    formatDate(value, fmt) {
      fmt = fmt || 'YYYY-MM-DD HH:mm:ss'
      return dayjs(value).format(fmt)
    }
  },
  props: {
    list: Array
  },
  data() {
    return {
      list: []
    }
  }
}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
  .zookeeper-list {
    .state {
      text-align: center;
      display: block;
      >i {
        font-size: 18px;
      }
      .success {
        color: #33cc00;
      }
      .error {
        color: #ff0000;
      }
    }
  }
  .table-box {
  border-top: 1px solid #ecf3ff;
  .ans-checkbox-wrapper-disabled {
    .ans-checkbox-inner {
      background-color: #ccc;
    }
  }
  .ans-checkbox {
    .ans-checkbox-inner {
      border: 1px solid #ccc;
    }
  }
  .ans-checkbox-checked {
    .ans-checkbox-inner {
      border: 1px solid #1489e2;
    }
  }
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space:  nowrap;
    display: block;
  }
  button {
    .iconfont {
      font-size: 16px;
    }
    .ans-icon {
      font-size: 14px;
    }
  }
  table {
    width: 100%;
    &.fixed {
      table-layout: fixed;
    }
    th {
      background:#DCDFE6;
    }
    tr {
      height: 40px;
      box-sizing: border-box;
      background: #edf1f5;
      color: #333;
      font-size: 12px;
      border-bottom: 1px solid #ecf3ff;
      &:hover {
        background: #ddecff;
      }
      th,td{
        &:nth-child(1) {
          width: 50px;
          text-align: center;
        }
      }
      th {
        &:nth-child(1) {
          width: 60px;
          text-align: center;
        }
        >span {
          font-size: 12px;
          color: #555;
        }
      }
      td {
        >span {
          font-size: 12px;
          color: #666;
        }
        &:nth-child(1) {
          span {
            text-align: center;
          }
        }
      }
    }
  }
  .links {
    color: #2d8cf0;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

