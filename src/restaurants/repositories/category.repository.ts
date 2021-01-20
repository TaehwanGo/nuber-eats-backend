import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase().replace(/ +/g, ' '); // 정규식 공부 필요 !
    // trim() : 앞, 뒤 space를 지워줌
    const categorySlug = categoryName.replace(/ /g, '-'); // '/ /g':regular expression
    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
