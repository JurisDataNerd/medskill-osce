import AdminLayout from "@/layouts/AdminLayout";

export default function LiveMonitorPage(){

return(

<AdminLayout>

<h1 className="mb-8 text-3xl font-bold">

Live Monitor

</h1>

<div className="grid grid-cols-4 gap-6">

<div className="col-span-3 rounded-2xl bg-white p-6 shadow min-h-[650px]">

Realtime Monitor Peserta

</div>

<div className="rounded-2xl bg-white p-6 shadow">

Timer

<br/>

Rotation

<br/>

Current Station

</div>

</div>

</AdminLayout>

);

}