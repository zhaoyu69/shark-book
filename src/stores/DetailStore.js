import { observable, action, computed, toJS } from "mobx";
import AccountService from "services/AccountService";
import {globalStore} from "stores/GlobalStore";

export default class DetailStore{
    @observable accounts=[];
    @observable showTime=moment();

    // 显示年
    @computed get showYear() {
        return this.showTime.year();
    }
    // 显示月
    @computed get showMonth() {
        return this.showTime.month() + 1;
    }

    // 选择时间
    @action timeSelect=(time)=>{
        this.showTime = moment(time);
    };
    // 获取所有账单
    @action getAccounts=async()=> {
        this.accounts = await AccountService.getAccounts(globalStore.userId);
    };

    // 按年月过滤账单
    @computed get accountsByTime() {
        return toJS(this.accounts).filter(acc =>
            moment(acc).year() === this.showYear && moment(acc).month() + 1 === this.showMonth)
    }

    // 年月账单按支出/收入分组
    @computed get timeAccountsByClassify() {
        return _.groupBy(toJS(this.accountsByTime), (timeAccount)=>{
            return timeAccount.userType.type.classify;
        });
    }

    // 获得月总支出/收入
    @computed get paysByMonth() {
        return this.timeAccountsByClassify["pay"]
            && _.round(_.sum(this.timeAccountsByClassify["pay"].map(acc=>acc.price)), 2)
            || "0.00";
    }
    // 获得月总支出/收入
    @computed get incomesByMonth() {
        return this.timeAccountsByClassify["income"]
            && _.round(_.sum(this.timeAccountsByClassify["income"].map(acc=>acc.price)), 2)
            || "0.00";
    }

    // 按日分组账单
    @computed get timeAccountsByDate() {
        return _.groupBy(this.accountsByTime, (account) => moment(account.time).date());
    }

    // 每个月有账单的日子[1,2,...]
    @computed get dates() {
        return Object.keys(toJS(this.timeAccountsByDate));
    }

    // 获取星期几
    @action getDay(timeAccount) {
        const week = moment(timeAccount.time).day();
        const weeks=["一","二","三","四","五","六","日"];
        return weeks[week - 1];
    }

    // 获得日总支出/收入
    @action getPaysOrIncomesByDate(timeAccounts) {
        // 日账单按收入支出再分类
        const timeAccountsByDateClassify = _.groupBy(timeAccounts, (timeAccount)=>{
            return timeAccount.userType.type.classify;
        });
        const pays = timeAccountsByDateClassify["pay"]
            && _.round(_.sum(timeAccountsByDateClassify["pay"].map(acc=>acc.price)), 2)
            || "0.00";
        const incomes = timeAccountsByDateClassify["income"]
            && _.round(_.sum(timeAccountsByDateClassify["income"].map(acc=>acc.price)), 2)
            || "0.00";
        return {pays, incomes};
    }

    // 删除记账
    @action removeAccount=async(accountId)=>{
        await AccountService.removeAccount(accountId);
        this.getAccounts();
    };
}

export const detailStore = new DetailStore();