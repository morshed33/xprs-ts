
class GenericService<T, CreateInput, WhereInput> {
    private model: any;

    constructor(model: any) {
        this.model = model;
    };

    async create(data: CreateInput): Promise<T> {
        return await this.model.create({ data });
    }

    async getById(id: string): Promise<T | null> {
        return await this.model.findUnique({ where: { id } });
    }

    async findOne(criteria: WhereInput): Promise<T | null> {
        return await this.model.findFirst({ where: criteria });
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return await this.model.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<T | null> {
        return await this.model.delete({ where: { id } });
    }

    async findAll(filters?: WhereInput): Promise<T[]> {
        return await this.model.findMany({ where: filters });
    }
}

export default GenericService;
