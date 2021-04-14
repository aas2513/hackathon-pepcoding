const puppeteer=require("puppeteer");
const fs=require("fs");

let finalData=[];
// let findstocks=["INE500A01029","INE237A01028","INE090A01021","INE406A01037","INE528G01035"];
let findstocks=["ICICI BANK LTD","KOTAK MAHINDRA BANK LTD","YES BANK LTD","CIPLA LTD","AUROBINDO PHARMA LTD"];


async function main(){
    const browser = await puppeteer.launch({
        headless:false,
        defaultViewport:false,
        args:["--start-maximized"]
    });
    let pages= await browser.pages();
    let tab=pages[0];
    await tab.goto("https://www.bseindia.com");
 
    for(let i=0;i<findstocks.length;i++){
      await  getStocks(tab,findstocks[i],i);
    }
    fs.writeFileSync("info.json",JSON.stringify(finalData));
}

async function getStocks(tab,name,idx){
    await tab.waitForSelector("#getquotesearch",{visible:true});
    await tab.type("#getquotesearch",name);
    await tab.keyboard.press("Enter");

    await tab.waitForNavigation({waitUntil:"networkidle0"});
    let Sname=await tab.$(".stockreach_title")
    let stockname=await tab.evaluate(function(ele){
        return ele.textContent; 
    },Sname);

    finalData.push({"StockName": stockname, "StockInfo" : []});

    let price =await tab.$("#idcrval")
    let stockprice=await tab.evaluate(function(ele){
        return ele.textContent; 
    },price);

    finalData[idx]["StockInfo"].push({"PriceToday" : stockprice});
         
    let increaseDecrease =await tab.$(".sensexbluetext")
    let fluc=await tab.evaluate(function(ele){
        return ele.textContent; 
    },increaseDecrease);

    finalData[idx]["StockInfo"].push({"Fluctuation" : fluc});

    let stocksData= await getStocksInfo(tab);

    finalData[idx]["StockInfo"].push(stocksData);

}

async function getStocksInfo(tab){
    let tempData=[];
    let keys = [];
    let values=[];
    let tables = await tab.$$(".col-lg-13");
    for(let i=0;i<4;i++){
        let dataRows = await tables[i].$$("tbody tr");
        for(let i = 0; i < dataRows.length; i=i+2) {
            let dataColums = await dataRows[i].$$("td");
            
            let key = await tab.evaluate(function(ele){
                return ele.textContent;
            }, dataColums[0]);
            keys.push(key);

            let value = await tab.evaluate(function(ele){
                return ele.textContent;
            }, dataColums[1]);
            values.push(value);
        } 
    }
    for(let i=0;i<keys.length;i++){
        tempData.push(keys[i]+ " : " + values[i]);
        }
    return tempData;
}

main();