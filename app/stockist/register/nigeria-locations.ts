const nigeriaLocations = {
  // ...Previous states already added above

  "Kaduna": {
    lgas: [
      "Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South",
      "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"
    ],
    zones: ["Kaduna North", "Kaduna Central", "Kaduna South"]
  },
  "Katsina": {
    lgas: [
      "Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dandume", "Danja", "Dan Musa", "Daura",
      "Dutsi", "Dutsin-Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia",
      "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi",
      "Sabuwa", "Safana", "Sandamu", "Zango"
    ],
    zones: ["Katsina North", "Katsina Central", "Katsina South"]
  },
  "Kebbi": {
    lgas: [
      "Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu",
      "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"
    ],
    zones: ["Kebbi North", "Kebbi Central", "Kebbi South"]
  },
  "Kogi": {
    lgas: [
      "Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela-Odolu", "Ijumu", "Kabba/Bunu",
      "Kogi", "Lokoja", "Mopa-Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"
    ],
    zones: ["Kogi East", "Kogi Central", "Kogi West"]
  },
  "Kwara": {
    lgas: [
      "Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin",
      "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"
    ],
    zones: ["Kwara North", "Kwara Central", "Kwara South"]
  },
  "Nasarawa": {
    lgas: [
      "Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"
    ],
    zones: ["Nasarawa North", "Nasarawa South", "Nasarawa West"]
  },
  "Niger": {
    lgas: [
      "Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai",
      "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Muya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"
    ],
    zones: ["Niger North", "Niger East", "Niger South"]
  },
  "Ogun": {
    lgas: [
      "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East",
      "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda",
      "Odogbolu", "Ogun Waterside", "Remo North", "Sagamu"
    ],
    zones: ["Ogun Central", "Ogun East", "Ogun West"]
  },
  "Ondo": {
    lgas: [
      "Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South",
      "Ese Odo", "Idanre", "Ifedore", "Ilaje", "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"
    ],
    zones: ["Ondo North", "Ondo Central", "Ondo South"]
  },
  "Osun": {
    lgas: [
      "Aiyedaade", "Aiyedire", "Atakunmosa East", "Atakunmosa West", "Boluwaduro", "Boripe", "Ede North", "Ede South",
      "Egbedore", "Ejigbo", "Ife Central", "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila", "Ilesa East",
      "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"
    ],
    zones: ["Osun Central", "Osun East", "Osun West"]
  },
  "Oyo": {
    lgas: [
      "Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West",
      "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo",
      "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa",
      "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"
    ],
    zones: ["Oyo North", "Oyo Central", "Oyo South"]
  },
  "Plateau": {
    lgas: [
      "Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North",
      "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"
    ],
    zones: ["Plateau North", "Plateau Central", "Plateau South"]
  },
  "Rivers": {
    lgas: [
      "Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme",
      "Emohua", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika",
      "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"
    ],
    zones: ["Rivers East", "Rivers West", "Rivers South-East"]
  },
  "Sokoto": {
    lgas: [
      "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware",
      "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta",
      "Wamako", "Wurno", "Yabo"
    ],
    zones: ["Sokoto East", "Sokoto North", "Sokoto South"]
  },
  "Taraba": {
    lgas: [
      "Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kurmi", "Lau", "Sardauna",
      "Takum", "Ussa", "Wukari", "Yorro", "Zing"
    ],
    zones: ["Taraba North", "Taraba Central", "Taraba South"]
  },
  "Yobe": {
    lgas: [
      "Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina",
      "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"
    ],
    zones: ["Yobe East", "Yobe North", "Yobe South"]
  },
  "Zamfara": {
    lgas: [
      "Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun",
      "Maru", "Shinkafi", "Talata Mafara", "Chafe", "Zurmi"
    ],
    zones: ["Zamfara North", "Zamfara Central", "Zamfara West"]
  }
};
