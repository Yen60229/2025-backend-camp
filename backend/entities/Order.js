const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Order',
  tableName: 'ORDER',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false
    },
    user_id: {
      type: 'uuid',
      nullable: false
    },
    credit_package_id: {
      type: 'uuid',
      nullable: false
    },
    merchant_order_no: {
      type: 'varchar',
      length: 30,
      unique: true,
      nullable: false
    },
    amount: {
      type: 'integer',
      nullable: false
    },
    purchased_credits: {
      type: 'integer',
      nullable: false
    },
    payment_status: {
      type: 'varchar',
      length: 20,
      default: 'unpaid',
      nullable: false
    },
    newebpay_trade_no: {
      type: 'varchar',
      length: 30,
      nullable: true
    },
    payment_type: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    paid_at: {
      type: 'timestamp',
      nullable: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at',
      nullable: false
    }
  },
  relations: {
    User: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_user_id_fk'
      }
    },
    CreditPackage: {
      target: 'CreditPackage',
      type: 'many-to-one',
      joinColumn: {
        name: 'credit_package_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'order_credit_package_id_fk'
      }
    }
  }
})
