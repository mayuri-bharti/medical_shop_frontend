const subcategoryProducts = {
  'pain-relief': {
    title: 'Pain Relief Essentials',
    description: 'Trusted analgesics and fast-relief solutions for headaches, muscle pain, and joint discomfort.',
    bannerImage: 'https://images.unsplash.com/photo-1582719478250-428daf0c0d4b?w=1200&q=80&auto=format&fit=crop',
    relatedCategory: 'Prescription Medicines',
    products: [
      {
        _id: 'demo-pain-1',
        name: 'Paracetamol 500mg Tablets',
        brand: 'MediCure',
        price: 45,
        mrp: 60,
        stock: 27,
        category: 'Pain Relief',
        images: ['https://images.unsplash.com/photo-1580281780460-82d277b0e3a3?w=640&q=80&auto=format&fit=crop']
      },
      {
        _id: 'demo-pain-2',
        name: 'Diclofenac Gel 1% (30g)',
        brand: 'FlexiRelief',
        price: 95,
        mrp: 120,
        stock: 14,
        category: 'Pain Relief',
        images: ['https://images.unsplash.com/photo-1581579186989-6fd7b6c9ad21?w=640&q=80&auto=format&fit=crop']
      },
      {
        _id: 'demo-pain-3',
        name: 'Ibuprofen 400mg Capsules – 15s',
        brand: 'HealFast',
        price: 110,
        mrp: 135,
        stock: 42,
        category: 'Pain Relief',
        images: ['https://images.unsplash.com/photo-1584367369853-8b966cf85737?w=640&q=80&auto=format&fit=crop']
      }
    ]
  },
  'antibiotics': {
    title: 'Antibiotic Care',
    description: 'Broad-spectrum antibiotics and doctor-trusted regimens to fight bacterial infections effectively.',
    bannerImage: 'https://images.unsplash.com/photo-1603399059641-2e65c1640975?w=1200&q=80&auto=format&fit=crop',
    relatedCategory: 'Prescription Medicines',
    products: [
      {
        _id: 'demo-antibiotic-1',
        name: 'Amoxicillin 500mg Capsules – 10s',
        brand: 'BioTrust',
        price: 180,
        mrp: 210,
        stock: 18,
        category: 'Antibiotics',
        images: ['https://images.unsplash.com/photo-1580281657521-94d117b79a3b?w=640&q=80&auto=format&fit=crop']
      },
      {
        _id: 'demo-antibiotic-2',
        name: 'Azithromycin 500mg Tablets – 3s',
        brand: 'ZithroMed',
        price: 85,
        mrp: 110,
        stock: 33,
        category: 'Antibiotics',
        images: ['https://images.unsplash.com/photo-1584366756621-4f4e9db78c81?w=640&q=80&auto=format&fit=crop']
      }
    ]
  },
  'allergy-cold': {
    title: 'Allergy & Cold Relief',
    description: 'Antihistamines and cold-care medicines for clear breathing and symptom-free days.',
    bannerImage: 'https://images.unsplash.com/photo-1583947215259-38e31be87590?w=1200&q=80&auto=format&fit=crop',
    relatedCategory: 'Prescription Medicines',
    products: [
      {
        _id: 'demo-allergy-1',
        name: 'Cetirizine 10mg Tablets – 10s',
        brand: 'AllerFree',
        price: 45,
        mrp: 60,
        stock: 37,
        category: 'Allergy & Cold',
        images: ['https://images.unsplash.com/photo-1562240020-ce31ccb0fa74?w=640&q=80&auto=format&fit=crop']
      },
      {
        _id: 'demo-allergy-2',
        name: 'Cold Relief Syrup (100ml)',
        brand: 'Respira',
        price: 120,
        mrp: 145,
        stock: 21,
        category: 'Allergy & Cold',
        images: ['https://images.unsplash.com/photo-1458538977777-0549b2370168?w=640&q=80&auto=format&fit=crop']
      }
    ]
  },
  'diabetes-care': {
    title: 'Diabetes Care',
    description: 'Monitor and manage glucose levels with reliable diabetic care essentials.',
    bannerImage: 'https://images.unsplash.com/photo-1583912093053-24eb60f71684?w=1200&q=80&auto=format&fit=crop',
    relatedCategory: 'Chronic Diseases',
    products: [
      {
        _id: 'demo-diabetes-1',
        name: 'Metformin 500mg Tablets – 20s',
        brand: 'GlucoBalance',
        price: 95,
        mrp: 120,
        stock: 24,
        category: 'Diabetes Care',
        images: ['https://images.unsplash.com/photo-1502741126161-b048400d0fda?w=640&q=80&auto=format&fit=crop']
      },
      {
        _id: 'demo-diabetes-2',
        name: 'Blood Glucose Test Strips – 50 pack',
        brand: 'GlucoTrack',
        price: 699,
        mrp: 799,
        stock: 11,
        category: 'Diabetes Care',
        images: ['https://images.unsplash.com/photo-1580280529640-e01f49c52e94?w=640&q=80&auto=format&fit=crop']
      }
    ]
  },
  'cardiology-meds': {
    title: 'Heart & Cardiology Care',
    description: 'Doctor-recommended cardiac medicines and supplements for long-term heart health.',
    bannerImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&q=80&auto=format&fit=crop',
    relatedCategory: 'Chronic Diseases',
    products: [
      {
        _id: 'demo-cardiology-1',
        name: 'Atorvastatin 20mg Tablets – 15s',
        brand: 'CardioSafe',
        price: 230,
        mrp: 265,
        stock: 18,
        category: 'Cardiology Meds',
        images: ['https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=640&q=80&auto=format&fit=crop']
      },
      {
        _id: 'demo-cardiology-2',
        name: 'Aspirin 75mg EC Tablets – 14s',
        brand: 'HeartGuard',
        price: 35,
        mrp: 50,
        stock: 41,
        category: 'Cardiology Meds',
        images: ['https://images.unsplash.com/photo-1583275477744-4e86f5e76054?w=640&q=80&auto=format&fit=crop']
      }
    ]
  }
}

export const getSubcategoryData = (slug) => subcategoryProducts[slug] || null

export const getSubcategoryList = () =>
  Object.entries(subcategoryProducts).map(([slug, meta]) => ({
    slug,
    ...meta
  }))

export default subcategoryProducts
