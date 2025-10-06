import { createClient } from '@supabase/supabase-js';
import { products, categories } from './src/data/products.js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('Starting database seeding...');

  const categoryMap = {};

  console.log('\nInserting categories...');
  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: cat.name,
          description: cat.description,
          image: cat.image,
          icon: cat.icon,
          slug: cat.id,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', cat.id)
          .maybeSingle();

        if (existing) {
          categoryMap[cat.id] = existing.id;
          console.log(`Category "${cat.name}" already exists, using existing ID`);
        }
      } else {
        console.error(`Error inserting category ${cat.name}:`, error.message);
      }
    } else {
      categoryMap[cat.id] = data.id;
      console.log(`✓ Inserted category: ${cat.name}`);
    }
  }

  console.log('\nInserting products...');
  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const categoryId = categoryMap[product.category] || null;

    const { error } = await supabase.from('products').insert([
      {
        name: product.name,
        category_id: categoryId,
        price: product.price,
        original_price: product.originalPrice || product.price,
        image: product.image,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        description: product.description || '',
        features: product.features || [],
        in_stock: product.inStock ?? true,
        featured: product.featured ?? false,
      },
    ]);

    if (error) {
      console.error(`✗ Error inserting product ${product.name}:`, error.message);
      errorCount++;
    } else {
      console.log(`✓ Inserted product: ${product.name}`);
      successCount++;
    }
  }

  console.log(`\n✓ Database seeding complete!`);
  console.log(`  Categories: ${Object.keys(categoryMap).length}`);
  console.log(`  Products: ${successCount} successful, ${errorCount} errors`);
}

seedDatabase().catch(console.error);
