import { useParams } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";

export default function CaseChecklistPage(){

const { id } = useParams();

return(

<AdminLayout>

<div className="mb-8 flex items-center justify-between">

<h1 className="text-3xl font-bold">

Checklist Penilaian

</h1>

<button className="rounded-xl bg-green-600 px-5 py-3 text-white">

+ Add Item

</button>

</div>

<div className="rounded-2xl bg-white p-8 shadow">

Belum ada checklist.

</div>

</AdminLayout>

);

}