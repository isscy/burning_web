<template>
  <div>
    <Row :gutter="20">
      <i-col :xs="12" :md="8" :lg="4" v-for="(infor, i) in inforCardData" :key="`infor-${i}`" style="height: 120px;padding-bottom: 10px;">
        <infor-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36">
          <count-to :end="infor.count" count-class="count-style"/>
          <p>{{ infor.title }}</p>
        </infor-card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
      <i-col :md="24" :lg="8" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie style="height: 300px;" :value="pieData" text="用户访问来源"></chart-pie>
        </Card>
      </i-col>
      <i-col :md="24" :lg="16" style="margin-bottom: 20px;">
        <Card shadow>
          <chart-bar style="height: 300px;" :value="barData" text="每周用户活跃量"/>
        </Card>
      </i-col>
    </Row>
    <!-- <Row>
      <Card shadow>
        <example style="height: 310px;"/>
      </Card>
    </Row> -->
  </div>
</template>

<script>
import InforCard from "_c/info-card";
import CountTo from "_c/count-to";
import { ChartPie, ChartBar } from "_c/charts";
import {igetRequst,postRequst,putRequst,igetDownload,postUpload} from "@/api/data";
// import Example from './example.vue'
export default {
  name: "home",
  components: {
    InforCard,
    CountTo,
    ChartPie,
    ChartBar
    // Example
  },
  data() {
    return {
      cardNumber: {
        user: 2
      },
      inforCardData: [
            { title: '全部用户', icon: 'md-person-add', count: 0, color: '#2d8cf0' },
            { title: '一周登陆', icon: 'md-locate', count: 0, color: '#19be6b' },
            { title: '赛事总计', icon: 'md-bicycle', count: 0, color: '#a26a90' },
            { title: '待审核报名', icon: 'md-help-circle', count: 0, color: '#ff9900' },
            { title: '新闻总计', icon: 'md-share', count: 0, color: '#ed3f14' },
            { title: '评论总计', icon: 'md-chatbubbles', count: 0, color: '#E46CBB' },
        ],

      pieData: [
        { value: 335, name: "Chrome" },
        { value: 310, name: "Firefox" },
        { value: 234, name: "IE" },
        { value: 135, name: "safari" },
        { value: 1548, name: "其他" }
      ],
      barData: {
        Mon: 13253,
        Tue: 34235,
        Wed: 26321,
        Thu: 12340,
        Fri: 24643,
        Sat: 1322,
        Sun: 1324
      }
    };
  },
  methods: {
      initCardData(){
          igetRequst('bkm-home/card', {}).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                let data = r.data;
                this.inforCardData = [
                    { title: '全部用户', icon: 'md-person-add', count: data.user, color: '#2d8cf0' },
                    { title: '一周登陆', icon: 'md-locate', count: data.login, color: '#19be6b' },
                    { title: '赛事总计', icon: 'md-bicycle', count: data.game, color: '#a26a90' },
                    { title: '待审核报名', icon: 'md-help-circle', count: 0, color: '#ff9900' },
                    { title: '新闻总计', icon: 'md-share', count: data.news, color: '#ed3f14' },
                    { title: '评论总计', icon: 'md-chatbubbles', count: data.comment, color: '#E46CBB' },
                ];
                
            }).catch(err => {
                this.loading = false;
                this.$Message.info('获取数据错误!'); return false;
            })

      },
  },
  mounted() {
    //
  },
  created() {
      this.initCardData();
  }
};
</script>

<style lang="less">
.count-style {
  font-size: 50px;
}
</style>
