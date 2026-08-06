/**
 * MASTER CATALOG PEMERIKSAAN PENUNJANG OSCE (INDONESIA)
 * Berdasarkan formulir standar checklist pemeriksaan penunjang (image1.png - image4.png).
 */

export const AUXILIARY_EXAM_CATALOG = [
  {
    category: "RADIOLOGI",
    subcategories: [
      {
        name: "Thorax",
        items: [
          { id: "rad_thorax_ap", name: "Thorax AP" },
          { id: "rad_thorax_pa", name: "Thorax PA" },
          { id: "rad_thorax_lateral", name: "Thorax Lateral" },
          { id: "rad_sternum_costae", name: "Sternum & Costae" },
          { id: "rad_top_lordotik", name: "Top Lordotik" },
        ],
      },
      {
        name: "Cranium",
        items: [
          { id: "rad_cranium_ap", name: "Cranium AP" },
          { id: "rad_cranium_lateral", name: "Cranium Lateral" },
          { id: "rad_waters", name: "Waters" },
          { id: "rad_nasal_bone", name: "Nasal Bone" },
          { id: "rad_mastoid", name: "Mastoid" },
          { id: "rad_mandibula_maxilla", name: "Mandibula / Maxilla" },
          { id: "rad_tmj", name: "TMJ" },
        ],
      },
      {
        name: "Vertebrae",
        items: [
          { id: "rad_v_cervical", name: "V. Cervical AP / Lat / Oblq" },
          { id: "rad_v_thoracal", name: "V. Thoracal AP / Lat" },
          { id: "rad_v_thoracolumbal", name: "V. Thoracolumbal AP / Lat" },
          { id: "rad_v_lumbosacral", name: "V. Lumbosacral AP / Lat" },
          { id: "rad_v_lumbal", name: "V. Lumbal AP / Lat" },
          { id: "rad_v_sacrum_coccygeus", name: "V. Sacrum / Coccygeus AP / Lat" },
        ],
      },
      {
        name: "Extremitas Atas / Bawah (D = Dextra, S = Sinistra)",
        items: [
          { id: "rad_manus", name: "Manus AP / Oblq / Lat (D / S)" },
          { id: "rad_wrist_joint", name: "Wrist Joint AP / Lat (D / S)" },
          { id: "rad_antebrachi", name: "Antebrachi AP / Lat (D / S)" },
          { id: "rad_elbow_joint", name: "Elbow J / Cubiti AP / Lat (D / S)" },
          { id: "rad_humerus", name: "Humerus AP / Lat (D / S)" },
          { id: "rad_shoulder_joint", name: "Shoulder Joint AP / Lat (D / S)" },
          { id: "rad_clavicula", name: "Clavicula (D / S)" },
          { id: "rad_scapula", name: "Scapula (D / S)" },
          { id: "rad_femur", name: "Femur AP / Lat (D / S)" },
          { id: "rad_hip_joint", name: "Hip Joint AP / Lat (D / S)" },
          { id: "rad_genue", name: "Genue AP / Lat (D / S)" },
          { id: "rad_cruris", name: "Cruris AP / Lat (D / S)" },
          { id: "rad_ankle", name: "Ankle AP / Lat (D / S)" },
          { id: "rad_pedis", name: "Pedis AP / Lat (D / S)" },
          { id: "rad_calcaneus", name: "Calcaneus AP / Lat (D / S)" },
        ],
      },
      {
        name: "Gigi",
        items: [{ id: "rad_panoramic", name: "Panoramic" }],
      },
      {
        name: "BNO / Pelvis",
        items: [
          { id: "rad_bno_ap", name: "BNO AP" },
          { id: "rad_bno_3_posisi", name: "BNO 3 Posisi" },
          { id: "rad_pelvis_ap_lat", name: "Pelvis AP / Lat" },
        ],
      },
      {
        name: "Pemeriksaan dengan Kontras Media",
        items: [
          { id: "rad_bno_ivp", name: "BNO-IVP" },
          { id: "rad_colon_in_loop", name: "Colon in Loop" },
          { id: "rad_omd", name: "OMD" },
          { id: "rad_oesophagography", name: "Oesophagography" },
          { id: "rad_urethrography", name: "Urethrography" },
          { id: "rad_cystografi", name: "Cystografi" },
          { id: "rad_urethrocystografi", name: "Urethrocystografi" },
          { id: "rad_appendicogram", name: "Appendicogram" },
          { id: "rad_fistulografi", name: "Fistulografi" },
          { id: "rad_hsg", name: "HSG" },
        ],
      },
      {
        name: "USG",
        items: [
          { id: "usg_abdomen", name: "USG Abdomen" },
          { id: "usg_transvaginal", name: "USG Transvaginal" },
          { id: "usg_transesofageal", name: "USG Transesofageal" },
          { id: "usg_thorax", name: "USG Thorax" },
          { id: "usg_mammae", name: "USG Mammae" },
          { id: "usg_kepala_bayi", name: "USG Kepala Bayi" },
          { id: "usg_testis", name: "USG Testis" },
          { id: "usg_leher", name: "USG Leher" },
        ],
      },
      {
        name: "CT SCAN Non Kontras",
        items: [
          { id: "ct_nk_kepala_spn_orbita", name: "CT Non Kontras Kepala / SPN / Orbita" },
          { id: "ct_nk_thorax", name: "CT Non Kontras Thorax" },
          { id: "ct_nk_nasofaring", name: "CT Non Kontras Nasofaring" },
          { id: "ct_nk_abdomen_pelvis", name: "CT Non Kontras Abdomen / Pelvis" },
          { id: "ct_nk_cervical", name: "CT Non Kontras Cervical" },
          { id: "ct_nk_thoracolumbal", name: "CT Non Kontras Thoracolumbal" },
          { id: "ct_nk_lumbosacral", name: "CT Non Kontras Lumbosacral" },
          { id: "ct_nk_ekstremitas_atas", name: "CT Non Kontras Ekstremitas Atas" },
          { id: "ct_nk_ekstremitas_bawah", name: "CT Non Kontras Ekstremitas Bawah" },
        ],
      },
      {
        name: "CT SCAN Kontras",
        items: [
          { id: "ct_k_kepala_spn_orbita", name: "CT Kontras Kepala / SPN / Orbita" },
          { id: "ct_k_thorax", name: "CT Kontras Thorax" },
          { id: "ct_k_nasofaring", name: "CT Kontras Nasofaring" },
          { id: "ct_k_abdomen_pelvis", name: "CT Kontras Abdomen / Pelvis" },
        ],
      },
    ],
  },
  {
    category: "HEMATOLOGI",
    subcategories: [
      {
        name: "Hematologi Rutin & Khusus",
        items: [
          { id: "hem_darah_lengkap_cbc", name: "Darah Lengkap - CBC" },
          { id: "hem_led", name: "LED (Laju Endap Darah)" },
          { id: "hem_hemoglobin", name: "Hemoglobin" },
          { id: "hem_eritrosit", name: "Eritrosit" },
          { id: "hem_hematokrit", name: "Hematokrit" },
          { id: "hem_mcv_mch_mchc", name: "MCV / MCH / MCHC" },
          { id: "hem_retikulosit", name: "Retikulosit" },
          { id: "hem_adt", name: "Apusan Darah Tepi - ADT" },
          { id: "hem_gol_darah_abo", name: "Golongan Darah ABO" },
          { id: "hem_gol_darah_rhesus", name: "Golongan Darah Rhesus" },
          { id: "hem_protein_c", name: "Protein C" },
          { id: "hem_protein_s", name: "Protein S" },
          { id: "hem_bma", name: "Bone Marrow Aspiration" },
          { id: "hem_immunofenotyping", name: "Immunofenotyping" },
        ],
      },
    ],
  },
  {
    category: "HEMOSTASIS",
    subcategories: [
      {
        name: "Pemeriksaan Hemostasis",
        items: [
          { id: "hemo_bt", name: "Bleeding Time - BT" },
          { id: "hemo_ct", name: "Clotting Time - CT" },
          { id: "hemo_pt", name: "PT (Prothrombin Time)" },
          { id: "hemo_inr_pt", name: "INR PT" },
          { id: "hemo_aptt", name: "APTT" },
          { id: "hemo_fibrinogen", name: "Fibrinogen" },
          { id: "hemo_d_dimer", name: "D-Dimer" },
          { id: "hemo_serum_iron", name: "Serum Iron" },
          { id: "hemo_tibc", name: "TIBC" },
          { id: "hemo_ferritin", name: "Ferritin" },
          { id: "hemo_g6pd", name: "G6PD" },
          { id: "hemo_asam_folat", name: "Asam Folat" },
          { id: "hemo_thrombin_time", name: "Thrombin Time" },
          { id: "hemo_mixing_test", name: "Mixing Test" },
          { id: "hemo_substitusi_test", name: "Substitusi Test" },
          { id: "hemo_factor_viii_ix", name: "Assay Factor VIII, IX" },
          { id: "hemo_oat_iii", name: "OAT III" },
        ],
      },
    ],
  },
  {
    category: "URINE",
    subcategories: [
      {
        name: "Pemeriksaan Urine",
        items: [
          { id: "uri_urinalisis_lengkap", name: "Urinalisis Lengkap" },
          { id: "uri_tes_kehamilan", name: "Tes Kehamilan (PPT)" },
          { id: "uri_protein_bence_jones", name: "Protein Bence Jones" },
          { id: "uri_protein_esbach", name: "Protein Esbach" },
          { id: "uri_narkoba_screening", name: "Narkoba-Screening" },
        ],
      },
    ],
  },
  {
    category: "FUNGSI HATI",
    subcategories: [
      {
        name: "Pemeriksaan Fungsi Hati",
        items: [
          { id: "liver_sgot", name: "SGOT" },
          { id: "liver_sgpt", name: "SGPT" },
          { id: "liver_gamma_gt", name: "Gamma-GT" },
          { id: "liver_alkali_fosfatase", name: "Alkali Fosfatase" },
          { id: "liver_bilirubin_total", name: "Bilirubin Total" },
          { id: "liver_bilirubin_direct", name: "Bilirubin Direct" },
          { id: "liver_bilirubin_indirect", name: "Bilirubin Indirect" },
          { id: "liver_albumin", name: "Albumin" },
        ],
      },
    ],
  },
  {
    category: "ENZIM",
    subcategories: [
      {
        name: "Pemeriksaan Enzim",
        items: [
          { id: "enz_amilase", name: "Amilase" },
          { id: "enz_lipase", name: "Lipase" },
          { id: "enz_cpk", name: "CPK" },
          { id: "enz_troponin_t", name: "Troponin T" },
          { id: "enz_troponin_i", name: "Troponin I" },
          { id: "enz_ck_mb", name: "CK-MB" },
          { id: "enz_ldh", name: "LDH" },
        ],
      },
    ],
  },
  {
    category: "PROFIL LIPID",
    subcategories: [
      {
        name: "Pemeriksaan Profil Lipid",
        items: [
          { id: "lip_kolesterol_total", name: "Kolesterol Total" },
          { id: "lip_trigliserida", name: "Trigliserida" },
          { id: "lip_hdl", name: "HDL" },
          { id: "lip_ldl", name: "LDL" },
        ],
      },
    ],
  },
  {
    category: "FUNGSI GINJAL",
    subcategories: [
      {
        name: "Pemeriksaan Fungsi Ginjal",
        items: [
          { id: "kidney_urea", name: "Urea" },
          { id: "kidney_ureum_24_jam", name: "Ureum 24 Jam" },
          { id: "kidney_creatinin", name: "Creatinin" },
        ],
      },
    ],
  },
  {
    category: "ELEKTROLIT",
    subcategories: [
      {
        name: "Pemeriksaan Elektrolit",
        items: [
          { id: "elec_natrium", name: "Natrium (Na)" },
          { id: "elec_kalium", name: "Kalium (K)" },
          { id: "elec_klordia", name: "Klordia (Cl)" },
          { id: "elec_kalsium", name: "Kalsium (Ca)" },
          { id: "elec_fosfor", name: "Fosfor (P)" },
          { id: "elec_asam_urat", name: "Asam Urat" },
        ],
      },
    ],
  },
  {
    category: "METABOLIK",
    subcategories: [
      {
        name: "Pemeriksaan Metabolik",
        items: [
          { id: "meta_gdp", name: "Glukosa Darah Puasa (GDP)" },
          { id: "meta_g2pp", name: "Glukosa 2 Jam PP" },
          { id: "meta_gds", name: "Glukosa Sewaktu (GDS)" },
          { id: "meta_hba1c", name: "HbA1c" },
          { id: "meta_c_peptide", name: "C-Peptide" },
          { id: "meta_protein_total", name: "Protein Total" },
          { id: "meta_globulin", name: "Globulin" },
          { id: "meta_albumin", name: "Albumin" },
          { id: "meta_laktat", name: "Laktat" },
          { id: "meta_beta_2_mikroglobulin", name: "Beta-2 Mikroglobulin" },
        ],
      },
    ],
  },
  {
    category: "FAECES",
    subcategories: [
      {
        name: "Pemeriksaan Faeces",
        items: [
          { id: "fae_faeces_lengkap_fl", name: "Faeces Lengkap - FL" },
          { id: "fae_darah_samar_fob", name: "Darah Samar - FOB" },
        ],
      },
    ],
  },
  {
    category: "TRANSFUSI",
    subcategories: [
      {
        name: "Pemeriksaan Transfusi",
        items: [
          { id: "trans_cross_match", name: "Cross Match" },
          { id: "trans_cross_test_anticoagulant", name: "Cross Test Anticoagulant" },
          { id: "trans_cross_test_direct", name: "Cross Test Direct" },
          { id: "trans_cross_test_indirect", name: "Cross Test Indirect" },
          { id: "trans_fibrin_glue", name: "Fibrin Glue" },
        ],
      },
    ],
  },
  {
    category: "CAIRAN TUBUH",
    subcategories: [
      {
        name: "Analisis Cairan Tubuh",
        items: [
          { id: "fluid_sperma", name: "Analisis Sperma" },
          { id: "fluid_liquor", name: "Analisis Cairan Liquor" },
          { id: "fluid_pleura", name: "Analisis Cairan Pleura" },
          { id: "fluid_ascites", name: "Analisis Cairan Ascites" },
          { id: "fluid_transudat_eksudat", name: "Transudat / Eksudat" },
          { id: "fluid_batu_ginjal", name: "Analisis Batu Ginjal" },
        ],
      },
    ],
  },
  {
    category: "BLOOD GAS ANALYSIS (BGA)",
    subcategories: [
      {
        name: "Analisis Gas Darah",
        items: [{ id: "bga_analisis_gas_darah", name: "BGA (Blood Gas Analysis)" }],
      },
    ],
  },
  {
    category: "IMUNOLOGI - SEROLOGI",
    subcategories: [
      {
        name: "Imunologi & Serologi",
        items: [
          { id: "imu_hbsag", name: "HBsAg" },
          { id: "imu_anti_hbs", name: "Anti HBs" },
          { id: "imu_anti_hbc_total", name: "Anti HBc Total%" },
          { id: "imu_anti_hbc_igm", name: "Anti HBc IgM" },
          { id: "imu_anti_hbc_igg", name: "Anti HBc IgG" },
          { id: "imu_hbeag", name: "HBeAg" },
          { id: "imu_anti_hbe", name: "Anti HBe" },
          { id: "imu_hcv", name: "HCV" },
          { id: "imu_anti_hcv", name: "Anti HCV" },
          { id: "imu_anti_hcv_igm", name: "Anti HCV IgM" },
          { id: "imu_anti_hav", name: "Anti HAV" },
          { id: "imu_anti_hav_igm", name: "Anti HAV IgM" },
          { id: "imu_anf", name: "ANF" },
          { id: "imu_ana", name: "ANA" },
          { id: "imu_anti_ds_dna", name: "Anti ds-DNA" },
          { id: "imu_ahiv_ag", name: "AHIV Ag" },
          { id: "imu_ahiv_ab", name: "AHIV Ab" },
          { id: "imu_rheumatoid_factor", name: "Rheumatoid Factor" },
          { id: "imu_asto", name: "ASTO" },
          { id: "imu_anti_ccp", name: "Anti-CCP" },
          { id: "imu_crp_kuantitatif", name: "CRP Kuantitatif" },
          { id: "imu_toxoplasma_igg", name: "Toxoplasma IgG" },
          { id: "imu_toxoplasma_igm", name: "Toxoplasma IgM" },
          { id: "imu_rubella_igg", name: "Rubella IgG" },
          { id: "imu_rubella_igm", name: "Rubella IgM" },
          { id: "imu_cmv_igg", name: "CMV IgG" },
          { id: "imu_cmv_igm", name: "CMV IgM" },
          { id: "imu_hsv_igg", name: "HSV IgG" },
          { id: "imu_hsv_igm", name: "HSV IgM" },
          { id: "imu_ns1_dengue", name: "NS1 Dengue" },
          { id: "imu_dengue_igg", name: "Dengue IgG" },
          { id: "imu_dengue_igm", name: "Dengue IgM" },
          { id: "imu_tubex_tf", name: "Tubex TF" },
          { id: "imu_widal_test", name: "Widal Test" },
          { id: "imu_anti_m_tb_igg", name: "Anti M. TB IgG" },
          { id: "imu_anti_m_tb_igm", name: "Anti M. TB IgM" },
          { id: "imu_anti_hiv", name: "Anti HIV" },
          { id: "imu_vdrl", name: "VDRL" },
          { id: "imu_tpha", name: "TPHA" },
          { id: "imu_chikungunya_igm", name: "Chikungunya IgM" },
          { id: "imu_coombs_test", name: "Coombs Test" },
          { id: "imu_mantoux_test", name: "Mantoux Test" },
        ],
      },
    ],
  },
  {
    category: "TUMOR MARKER",
    subcategories: [
      {
        name: "Penanda Tumor",
        items: [
          { id: "tum_afp", name: "AFP" },
          { id: "tum_cea", name: "CEA" },
          { id: "tum_psa", name: "Prostate Specific Antigen (PSA)" },
          { id: "tum_ca_125", name: "CA 125" },
          { id: "tum_ca_19_9", name: "CA 19-9" },
          { id: "tum_ca_15_3", name: "CA 15-3" },
          { id: "tum_nse", name: "NSE" },
          { id: "tum_scc", name: "SCC" },
        ],
      },
    ],
  },
  {
    category: "PREPARAT GRAM / KULTUR",
    subcategories: [
      {
        name: "Pemeriksaan Mikrobiologi",
        items: [
          { id: "mic_pewarnaan_gram", name: "Pewarnaan Gram" },
          { id: "mic_pewarnaan_bta", name: "Pewarnaan BTA" },
          { id: "mic_preparat_koh", name: "Preparat KOH" },
          { id: "mic_wet_mount", name: "Wet Mount" },
          { id: "mic_darkfield", name: "Darkfield Microscopic" },
          { id: "mic_kultur_urin", name: "Kultur Urin" },
          { id: "mic_kultur_feses", name: "Kultur Feses" },
          { id: "mic_kultur_darah", name: "Kultur Darah" },
          { id: "mic_kultur_sputum", name: "Kultur Sputum" },
          { id: "mic_kultur_bakteri", name: "Kultur Bakteri" },
          { id: "mic_kultur_jamur", name: "Kultur Jamur" },
        ],
      },
    ],
  },
  {
    category: "HORMON",
    subcategories: [
      {
        name: "Pemeriksaan Hormon",
        items: [
          { id: "hor_tsh", name: "TSH" },
          { id: "hor_ft4", name: "FT4" },
          { id: "hor_ft3", name: "FT3" },
          { id: "hor_hcg_kuantitatif", name: "HCG Kuantitatif" },
          { id: "hor_progesteron", name: "Progesteron" },
          { id: "hor_testosteron", name: "Testosteron" },
          { id: "hor_estrogen", name: "Estrogen" },
          { id: "hor_prolaktin", name: "Prolaktin" },
        ],
      },
    ],
  },
  {
    category: "LAIN-LAIN",
    subcategories: [
      {
        name: "Pemeriksaan Penunjang Lain",
        items: [
          { id: "lain_ekg_12_lead", name: "EKG 12 Lead" },
          { id: "lain_spirometri", name: "Spirometri" },
          { id: "lain_procalcitonin", name: "Procalcitonin (PCT)" },
          { id: "lain_pemeriksaan_lain", name: "Pemeriksaan Lain-Lain" },
        ],
      },
    ],
  },
];

/**
 * Helper to get all items flattened as a single array for easy searching
 */
export const getAllAuxiliaryExamItems = () => {
  const items = [];
  AUXILIARY_EXAM_CATALOG.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      sub.items.forEach((item) => {
        items.push({
          ...item,
          category: cat.category,
          subcategory: sub.name,
        });
      });
    });
  });
  return items;
};
