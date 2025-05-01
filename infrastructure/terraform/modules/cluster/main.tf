resource "aws_eks_cluster" "quantum" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    public_access_cidrs     = ["10.0.0.0/8"]
  }

  encryption_config {
    resources = ["secrets"]
    provider {
      key_arn = aws_kms_key.eks.arn
    }
  }
}

resource "aws_eks_node_group" "trading_nodes" {
  for_each     = var.node_groups
  cluster_name = aws_eks_cluster.quantum.name
  node_role_arn = aws_iam_role.nodes.arn

  subnet_ids     = var.subnet_ids
  capacity_type  = each.value.capacity_type
  instance_types = [each.value.instance_type]

  scaling_config {
    min_size     = each.value.min_size
    max_size     = each.value.max_size
    desired_size = each.value.min_size
  }

  update_config {
    max_unavailable = 1
  }

  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }

  tags = {
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
  }
}