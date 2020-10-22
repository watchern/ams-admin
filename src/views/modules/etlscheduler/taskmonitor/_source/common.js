/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/**
 * State code table
 */
const stateType = [
  {
    code: '',
    label: '无'
  }, {
    code: 'SUBMITTED_SUCCESS',
    label: '提交成功'
  }, {
    code: 'RUNNING_EXEUTION',
    label: '正在运行'
  }, {
    code: 'READY_PAUSE',
    label: '准备暂停'
  }, {
    code: 'PAUSE',
    label: '暂停'
  }, {
    code: 'READY_STOP',
    label: '准备停止'
  }, {
    code: 'STOP',
    label: '停止'
  }, {
    code: 'FAILURE',
    label: '失败'
  }, {
    code: 'SUCCESS',
    label: '成功'
  }, {
    code: 'NEED_FAULT_TOLERANCE',
    label: '需要容错'
  }, {
    code: 'KILL',
    label: 'kill'
  }, {
    code: 'WAITTING_THREAD',
    label: '等待线程'
  }, {
    code: 'WAITTING_DEPEND',
    label: '等待依赖完成'
  }
]

export {
  stateType
}
