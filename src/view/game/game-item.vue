<style lang="less">
@import "./common.less";
</style>
<template>
    <div>
        <Card title="赛事子项管理">
            <Row>
                <Button icon="md-add" @click="dialogOpen('add')">新增</Button>
                <Button icon="md-create" @click="dialogOpen('edit')">编辑</Button>
            </Row>  
        </Card>
        <Row class="margin-top-10">
            <Table :loading="loading" :columns="tableTitle" :data="tableData" :stripe="true" highlight-row ref="currentRowTable" @on-current-change="selectOneRow"></Table>
            <div style="width:100%;height:15px"></div>
            <Page :total="page.total" :current="page.current" :page-size="page.size" show-sizer :page-size-opts="page.sizeOpts" @on-change="currentChange" @on-page-size-change="sizeChange" /> 
        </Row>

         <!-- ---------------------------------------------------------------------- 以下是 弹出框 ---------------------------------------------------------------------- -->
        <Modal v-model="visibility" :title="dialogName" width="600" ><!--  @on-ok="dialogSubmit" @on-cancel="dialogCancel"  -->
            <p class="dialog_p">
                <span class="dialog_p_item">名称:</span>
                <Input v-model="entity.name" placeholder="" style="width: 300px"/>
            </p>
            <p class="dialog_p">
                <span class="dialog_p_item">单位:</span>
                <Input v-model="entity.unit" placeholder="" style="width: 300px"/>
            </p>
            <p class="dialog_p">
                <span class="dialog_p_item">描述:</span>
                <Input v-model="entity.description" type="textarea" placeholder="" style="width: 300px"/>
            </p>
            <p class="dialog_p">
                <span class="dialog_p_item">状态:</span>
                <RadioGroup v-model="entity.status" type="button">
                    <Radio key="1" label="1">启用</Radio>
                    <Radio key="0" label="0">禁用</Radio>
                </RadioGroup>
            </p>
            <div slot="footer">
                <Button @click="dialogCancel">取消</Button>
                <Button type="primary" @click="dialogSubmit">提交</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import excel from "@/libs/excel";
import {getRequst,postRequst,putRequst} from "@/api/data";
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
            dialogName: '赛事子项',
            visibility: false
                
            
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
            getRequst('gameItem/list/admin', param, getToken()).then(res => {
                let r = res.data;
                if(r.code != '1' || r.data == null){
                    throw "err";
                }
                this.page.total = r.data.total;
                this.tableData = r.data.records
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
            if(!this.hadVal(this.entity.name) || !this.hadVal(this.entity.unit) || !this.hadVal(this.entity.status)){
                this.$Message.error('名称、单位、状态为必填项!');return false;
            }
            if(this.entity.target == 'edit' && !this.hadVal(this.entity.id)){
                this.$Message.error('空id错误'); return false;
            }
            if(this.entity.target == 'add'){
                postRequst('gameItem', this.entity).then(res => {
                    let r = res.data;
                    if(r.code != '1'){
                        throw "err";
                    }
                    this.$Message.info('提交成功!');
                    this.loadData();
                    this.dialogCancel();
                }).catch(err => {
                    this.loading = false;
                    this.$Message.error('提交错误!'); return false;
                })
            } else if (this.entity.target == 'edit'){
                putRequst('gameItem', this.entity).then(res => {
                    let r = res.data;
                    if(r.code != '1'){
                        throw "err";
                    }
                    this.$Message.info('提交成功!');
                    this.loadData();
                    this.dialogCancel();
                }).catch(err => {
                    this.loading = false;
                    this.$Message.error('提交错误!'); return false;
                })

            }
            

        },
        dialogCancel(){
            this.clearEntity();
            this.visibility = false;
        },
        selectOneRow(currentRow, oldCurrentRow){
            this.entity = currentRow;
            console.log(this.entity)
        },
        clearEntity(){
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
            {title:'编号', key : 'id'},
            {title:'名称', key : 'name'},
            {title:'单位', key : 'unit'},
            {
                title:'状态', key : 'status',
                render: function (h, params) {
                    let text = params.row.status == '1' ? '启用' : '禁用';
                    return h('div', text);
                }
            },
        ]
        this.loadData()
    },
    mounted() {}
};
</script>
<style>
    .dialog_p{
        margin-bottom: 15px;
    }
    .dialog_p_item {
        display:inline-block;
        width:30%;
        text-align:right;
        padding-right: 20px;
        font-size: 14px;
        line-height: 30px;
        vertical-align: center;
    }
</style>

