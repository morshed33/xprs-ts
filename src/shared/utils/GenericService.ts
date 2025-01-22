
class GenericService<T, CreateInput, WhereInput> {
    private model: any;

    constructor(model: any) {
        this.model = model;
    };

    async create(data: CreateInput): Promise<T> {
        console.log("-------------------------------------------------------in create-----------------------------")
        console.log(data)
        console.log("-------------------------------------------------------in create-----------------------------")
        return await this.model.create({ data });
    }

    // Get a record by ID
    async getById(id: string): Promise<T | null> {
        return await this.model.findUnique({ where: { id } });
    }

    // Find a record by criteria
    async findOne(criteria: WhereInput): Promise<T | null> {
        return await this.model.findFirst({ where: criteria });
    }

    // Update a record by ID
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
