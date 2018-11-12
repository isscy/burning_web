<style lang="less">
@import "./common.less";
</style>
<template>
    <div>
        <Card title="赛事审核管理">
            <Row>
                <!-- <Button icon="md-add" @click="dialogOpen('add')">新增</Button> -->
                <Button icon="md-create" @click="openAuditDialogMore()">审核</Button>
            </Row>  
        </Card>
        <Row class="margin-top-10">
            <Table :loading="loading" :columns="tableTitle" :data="tableData" :stripe="true" highlight-row ref="currentRowTable" @on-selection-change="selectMoreRow"></Table>
            <div style="width:100%;height:15px"></div>
            <Page :total="page.total" :current="page.current" :page-size="page.size" show-sizer :page-size-opts="page.sizeOpts" @on-change="currentChange" @on-page-size-change="sizeChange" /> 
        </Row>

         <!-- ---------------------------------------------------------------------- 以下是 弹出框 ---------------------------------------------------------------------- -->
        <Modal v-model="visibility" :title="dialogName" width="600" ><!--  @on-ok="dialogSubmit" @on-cancel="dialogCancel"  -->
            <Form ref="gameApplyForm" :model="entity" :label-width="120">
                <FormItem label="审核结果" prop="status">
                    <RadioGroup v-model="entity.status" type="button">
                        <Radio key="1" label="1">通过</Radio>
                        <Radio key="2" label="2">拒绝</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="审核备注" prop="remark">
                    <Input v-model="entity.remark" />
                </FormItem>
            </Form>
            <div slot="footer">
                <Button @click="dialogCancel">取消</Button>
                <Button type="primary" @click="audit">提交</Button>
            </div>
        </Modal>
        <!--  -------------------------------------以下是抽屉 ----------------------------------- - -->
        <Drawer :closable="false" width="400" v-model="viewVisibility">
            <p :style="pStyle">用户详情</p>
            <div class="demo-drawer-profile">
                <Row>
                    <Col span="6"> 真实姓名 </Col>
                    <Col span="12">{{viewEntity.realName}} </Col>
                </Row>
                <Row>
                    <Col span="6">性别</Col>
                    <Col span="12">{{viewEntity.sexName}} </Col>
                </Row>
                <Row>
                    <Col span="6">省市区</Col>
                    <Col span="12">{{viewEntity.proviceName}} &nbsp;&nbsp;{{viewEntity.cityName}} &nbsp;&nbsp; {{viewEntity.countyName}}</Col>
                </Row>
                <Row>
                    <Col span="6">详细地址</Col>
                    <Col span="12">{{viewEntity.address}} </Col>
                </Row>
                <Row>
                    <Col span="6">生日</Col>
                    <Col span="12">{{viewEntity.birthdayString}} </Col>
                </Row>
            </div>
            <Divider />
            <p :style="pStyle">赛事详情</p>
            <div class="demo-drawer-profile">
                <Row>
                    <Col span="6"> 最大人数 </Col>
                    <Col span="12">{{viewEntity.maxPeople}} </Col>
                </Row>
                <Row>
                    <Col span="6">成功报名</Col>
                    <Col span="12">{{viewEntity.pass}} </Col>
                </Row>
                <Row>
                    <Col span="6">报名截止</Col>
                    <Col span="12">{{viewEntity.applyEndTime}}</Col>
                </Row>
                <Row>
                    <Col span="6">赛事描述</Col>
                    <Col span="12">{{viewEntity.description}} </Col>
                </Row>
                
            </div>
        </Drawer>
    </div>
</template>
<script>
import excel from "@/libs/excel";
import {igetRequst,getRequst,postRequst,putRequst} from "@/api/data";
import {getToken} from '@/libs/util'
export default {
    name: "game-item",
    data() {
        return {
            search: '',
            status: '',
            loading: false,
            tableTitle: [],
            tableData: [],
            page: {
                'total': 0,
                current: 1,
                size: 10,
                sizeOpts: [4,10, 20]
            },
            entity: {},
            viewEntity:{},
            dialogName: '赛事子项',
            visibility: false,
            viewVisibility:false,
            pStyle: {fontSize: '16px',color: 'rgba(0,0,0,0.85)',lineHeight: '24px',display: 'block',marginBottom: '16px'},         // 抽屉样式
                
            
        };
    },
    methods: {
        loadData(){
            this.loading = true;
            let param = {
                'current': this.page.current,
                'size': this.page.size,
                'search': this.search,
                'status': this.status
            }
            getRequst('gameApply/list/admin', param, getToken()).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                this.page.total = r.data.total;
                let result = r.data.records
                result.forEach(e => {
                    if(e.status != '0')
                        e["_disabled"] = true
                });
                console.log(result)
                this.tableData = result
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                this.$Message.info('获取数据错误!'); return false;
            })

        },
        sizeChange(count){
            this.page.size = count;
            this.loadData();
        },
        currentChange(count){
            this.page.current = count;
            this.loadData();
        },
        showInDrawer(params){
            igetRequst('gameApply/userInfo/' + params.row.userId, {"gameId":params.row.gameId}).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                this.viewEntity = r.data;
                this.viewVisibility = true;
            }).catch(err => {
                this.$Message.info('找不到'); return false;
            })
        },
        
        audit(){
            if(!this.hadVal(this.entity.ids) || !this.hadVal(this.entity.status) || this.entity.ids.length == 0 ){
                this.$Message.error('缺少必填项!');return false;
            }
            putRequst('gameApply/appply', this.entity).then(res => {
                let r = res.data;
                if(r.code != '1'){
                    throw r.message;
                }
                this.$Message.info('提交成功!');
                this.loadData();
                this.dialogCancel();
            }).catch(err => {
                this.loading = false;
                this.$Message.error('提交错误! ' + err); return false;
            })
        },
        // 打开审核model - 只审核一条
        openAuditDialogOne(params){

        },
        // 打开审核model - 批量审核
        openAuditDialogMore(){
            if(this.entity.ids == null || this.entity.ids == "" ||  this.entity.ids == undefined || this.entity.ids.length == 0){
                this.$Message.error('请至少选中一行数据!'); return false;
            }
            this.visibility = true;


        },
        dialogOpen(type){
            if('add' == type){
                this.dialogName = '新增赛事子项';
                this.clearEntity();
                this.entity.target = 'add';
                this.visibility = true;
            }else if ('edit' == type) {
                this.dialogName = '修改赛事子项'
                if(!this.hadVal(this.entity) || !this.hadVal(this.entity.id)){
                    this.$Message.error('请选中一行数据!'); return false;
                }
                this.entity.target = 'edit';
                this.visibility = true;
            }
        },
        dialogSubmit(){
            
            

        },
        dialogCancel(){
            this.clearEntity();
            this.visibility = false;
        },
        selectMoreRow(currentRow){
            let ids = []
            currentRow.forEach( e => {
                ids.push(e.id)
            });
            this.entity = {
                "ids": ids
            }
            console.log(this.entity)
            // this.entity = currentRow;
            // console.log(this.entity)
        },
        clearEntity(){
            this.$refs.currentRowTable.selectAll(false)
            this.$refs.currentRowTable.clearCurrentRow();
            this.entity = {};
        },
        hadVal(val){
            if(val == null || val == '' || val == undefined)
                return false;
            return true;
        }
    
    },
    created() {
        this.tableTitle = [
            {type: 'selection',width: 60,align: 'center'},
            {title:'赛事名称', key : 'gameTitle'},
            {title:'报名人', key : 'userRealName'},
            {title:'状态', key : 'status',
                render: function (h, params) {
                    let text = ''; let sty = {}
                    if(params.row.status == '0'){
                        text = '审核中'
                    }
                    if(params.row.status == '1'){
                        text = '通过';sty = {color:'bule'}
                    }
                    if(params.row.status == '2'){
                        text = '拒绝';sty = {color:'red'}
                    }
                    return h('div',{style:sty}, text);
                }
            },
            {title:'审核备注', key : 'remark'},
            {title: '操作',key: 'action',
                render: (h, params) => {
                    let showStyle = {};
                    if(params.row.status != '0'){
                        showStyle = {"display":"none"};
                    }
                    return h('div', [
                        h('Button', {
                            props: {size: 'small'},
                            style: {marginRight: '5px'},
                            on: {click: () => {this.showInDrawer(params)}}
                        }, '查看'),
                        // h('Button', {
                        //     props: {type: 'primary',size: 'small'},
                        //     style: showStyle,
                        //     on: {click: () => {this.audit(params)}}
                        // }, '审核')
                    ]);
                }
            }
        ]
        this.loadData()
    },
    mounted() {}
};
</script>
<style>
   
    .demo-drawer-profile{
        font-size: 14px;
    }
    .demo-drawer-profile .ivu-col{
        margin-bottom: 12px;
    }
</style>

