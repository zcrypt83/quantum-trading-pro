module "prod_cluster" {
  source = "../../modules/cluster"

  cluster_name = "quantum-prod"
  node_groups = {
    low-latency = {
      instance_type  = "c6i.32xlarge"
      min_size       = 10
      max_size       = 100
      capacity_type  = "SPOT"
      taints         = [{ key = "dedicated", value = "trading", effect = "NO_SCHEDULE" }]
    }
  }

  vpc_id         = module.network.vpc_id
  subnet_ids     = module.network.private_subnets
  enable_autoscaler = true
}

module "market_data_db" {
  source = "../../modules/rds"

  engine         = "aurora-postgresql"
  instance_class = "db.r6g.16xlarge"
  storage_gb     = 50000
  iops           = 100000
  replica_count  = 5
  kms_key_arn    = aws_kms_key.database.arn
}