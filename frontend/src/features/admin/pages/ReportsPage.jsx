import AdminLayout from "@/layouts/AdminLayout";

export default function ReportsPage(){

return(

<AdminLayout>

<h1 className="mb-8 text-3xl font-bold">

Reports

</h1>

<div className="rounded-2xl bg-white p-6 shadow">

Generate PDF

<br/>

Send Email

</div>

</AdminLayout>

);

}