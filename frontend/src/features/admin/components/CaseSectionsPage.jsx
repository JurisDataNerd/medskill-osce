import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";

import AdminLayout from "@/layouts/AdminLayout";
import SectionModal from "@/features/admin/components/SectionModal";

import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "@/services/case.service";

export default function CaseSectionsPage() {

  const { id } = useParams();

  const [sections,setSections]=useState([]);
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState(null);

  async function load(){
    const data=await getSections(id);
    setSections(data);
  }

  useEffect(()=>{
    load();
  },[]);

  async function save(payload){

    if(selected){

      await updateSection(selected.id,payload);

    }else{

      await createSection({
        ...payload,
        case_id:id,
        section_order:sections.length+1,
      });

    }

    setOpen(false);
    setSelected(null);

    load();

  }

  async function remove(id){

    if(!confirm("Hapus stase?")) return;

    await deleteSection(id);

    load();

  }

  return(

    <AdminLayout>

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">

          Stations

        </h1>

        <button
          onClick={()=>setOpen(true)}
          className="rounded-xl bg-blue-600 px-5 py-3 text-white"
        >

          <Plus size={18}/>

        </button>

      </div>

      <div className="space-y-5">

        {sections.map((item)=>(

          <div
            key={item.id}
            className="rounded-2xl bg-white p-6 shadow"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-xl font-bold">

                  {item.title}

                </h2>

                <p className="mt-3 text-slate-500">

                  {item.configuration?.scenario}

                </p>

                <p className="mt-4">

                  Durasi :

                  {" "}

                  {item.configuration?.duration}

                  {" "}menit

                </p>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={()=>{
                    setSelected(item);
                    setOpen(true);
                  }}
                  className="rounded-lg border p-2"
                >

                  <Pencil size={18}/>

                </button>

                <button
                  onClick={()=>remove(item.id)}
                  className="rounded-lg border p-2 text-red-600"
                >

                  <Trash2 size={18}/>

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      <SectionModal
        open={open}
        initialData={selected}
        onClose={()=>{
          setOpen(false);
          setSelected(null);
        }}
        onSave={save}
      />

    </AdminLayout>

  );

}