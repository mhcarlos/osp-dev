//to get the comments: check ABTestingCommented.js in ABTesting Project
var OSPGROUP={};
OSPGROUP.ABTesting={};
OSPGROUP.ABTesting.REPARTITION=0.50;
OSPGROUP.ABTesting.GroupAId=1;
OSPGROUP.ABTesting.GroupBId=2;
OSPGROUP.ABTesting.NoGroupId=0;
OSPGROUP.ABTesting.getCookie=function(name){
var start=document.cookie.indexOf(name+"=");
var len=start+name.length+1;
if((!start)&&(name!=document.cookie.substring(0,name.length))){
return null;
}
if(start==-1)return null;
var end=document.cookie.indexOf(';',len);
if(end==-1)end=document.cookie.length;
return unescape(document.cookie.substring(len,end));
}
OSPGROUP.ABTesting.setCookie=function(name,value,expires,path,domain,secure){
var today=new Date();
today.setTime(today.getTime());
if(expires){
expires=expires*1000*60*60*24;
}
var expires_date=new Date(today.getTime()+(expires));
document.cookie=name+'='+escape(value)+
((expires)?';expires='+expires_date.toGMTString():'')+
((path)?';path='+path:'')+
((domain)?';domain='+domain:'')+
((secure)?';secure':'');
}
OSPGROUP.ABTesting.deleteCookie=function(name,path,domain){
if(getCookie(name))document.cookie=name+'='+
((path)?';path='+path:'')+
((domain)?';domain='+domain:'')+
';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}
OSPGROUP.ABTesting.getGroup=function()
{
var cookieValue;
if(!OSPGROUP.ABTesting.getCookie)return false;
cookieValue=parseInt(OSPGROUP.ABTesting.getCookie('ABTesting'));
if(isNaN(cookieValue))
{
cookieValue=OSPGROUP.ABTesting.NoGroupId;
}
return cookieValue;
}
OSPGROUP.ABTesting.chooseGroup=function()
{
var domain='';
var currentHost=document.location.hostname;
var domainCheck='.chm.r';
var ptr;
var num=Math.floor(Math.random()*100001);
num=Math.floor((num/100000)*(1/OSPGROUP.ABTesting.REPARTITION))>0?OSPGROUP.ABTesting.GroupBId:OSPGROUP.ABTesting.GroupAId;
ptr=currentHost.search(domainCheck);
if(ptr>=0)
{
domain=currentHost.substr(ptr+domainCheck.length,currentHost.length);
}
domain=(document.location.hostname.search(domain)>=0)?domain:'';
OSPGROUP.ABTesting.setCookie('ABTesting',num,'','/',domain,false)
return num;
}
OSPGROUP.ABTesting.GetABGroup=function()
{
var strReturn='NULL';
switch(OSPGROUP.ABTesting.getGroup())
{
case OSPGROUP.ABTesting.GroupAId:strReturn='Group A';break;
case OSPGROUP.ABTesting.GroupBId:strReturn='Group B';break;
}
return strReturn;
}
OSPGROUP.ABTesting.ABTestingObject=function(objId)
{
var ZoneIDs=new Array();
this.setContentGroupA=function(id)
{
setContent(OSPGROUP.ABTesting.GroupAId,id);
}
this.setContentGroupB=function(id)
{
setContent(OSPGROUP.ABTesting.GroupBId,id);
}
var setContent=function(index,id)
{
ZoneIDs[index]=id;
}
this.writeContent=function()
{
var contentOutput='';
try{
var group=OSPGROUP.ABTesting.getGroup();
if(group===OSPGROUP.ABTesting.NoGroupId)group=OSPGROUP.ABTesting.chooseGroup();
var inputZoneContent;
if(!group||typeof(group)!='number'||group>2)
group=0;
var inputZone=document.getElementById(ZoneIDs[group]);
if((inputZone!==null)&&(inputZone.innerHTML.length>0))
{ 
inputZoneContent=inputZone.innerHTML.replace(/<!--ABTOREMOVE/,'');
inputZoneContent=inputZoneContent.replace(/ABTOREMOVE-->/,'');
inputZoneContent=inputZoneContent.replace(/&lt;!--ABTOREMOVE/,'');
inputZoneContent=inputZoneContent.replace(/ABTOREMOVE--&gt;/,'');
contentOutput=inputZoneContent;
if(contentOutput!=null)
	document.write(contentOutput); 
}
}
catch(e){
contentOutput=document.getElementById('ABTestingDefaultContent_'+objId).innerHTML.replace(/<!--ABTOREMOVE/,'').replace(/<!--ABTOREMOVE/,'');
}
}
}
