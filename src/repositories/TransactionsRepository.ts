import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface StatementDTO {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomes = await this.find({ where: { type: 'income' } });
    const income = incomes.reduce((total: number, { value }) => {
      return total + value;
    }, 0);

    const outcomes = await this.find({ where: { type: 'outcome' } });
    const outcome = outcomes.reduce((total: number, { value }) => {
      return total + value;
    }, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }

  public async getStatement(): Promise<StatementDTO> {
    const transactions = await this.find({
      select: ['id', 'title', 'type', 'value', 'category'],
      relations: ['category'],
    });
    const balance = await this.getBalance();

    const statement = {
      transactions,
      balance,
    };

    return statement;
  }
}

export default TransactionsRepository;
