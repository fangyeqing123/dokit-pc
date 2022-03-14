<template>
  <el-row>
    <el-row justify="center" style="width:100%;height: 200px;text-align:center;">
      <el-button type="primary" round v-show="!showQRCode" @click="startSocketServer">开启socket中转服务</el-button>
      <div v-show="showQRCode">
        <span class="qrcode" id="qrcode"></span>
      </div>
    </el-row>
    
    <el-table
    :data="clientList"
    stripe
    style="width: 100%">
    <el-table-column
      prop="manufacturer"
      label="设备">
    </el-table-column>
    <el-table-column
      prop="id"
      label="序列号">
    </el-table-column>
  </el-table>
  </el-row>

</template>
<script>

export default {
  data() {
    return {
      showQRCode: false,
      clientList: []
    }
  },

  methods: {
    handleClick(tab, event) {
      console.log(tab, event)
    },
    createQRCode(url) {
        var $QR = document.querySelector('#qrcode')
        var QR = window.qrcode(0, 'L')
        $QR.setAttribute('href', url)
        QR.addData(url)
        QR.make()
        $QR.innerHTML = QR.createImgTag(6, 12)
      },
    startSocketServer() {
      this.initListener()
      // 发送同步消息
      let result = this.$electron.startSocketServer()
      this.createQRCode(`ws://${result.address}:${result.port}/proxy/multicontrol/default`)
      this.showQRCode = true
    },
    initListener() {
      this.$electron.onMulticontrolEmit((message)=> {
        this.clientList = message
      })
    }
  },
}
</script>
<style lang="scss" scope>
  
</style>