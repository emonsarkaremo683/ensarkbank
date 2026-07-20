package com.elitetech_inc.ensarkbank.account_management.account.repository;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Signature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignatureRepository extends JpaRepository<Signature,Long> {
    List<Signature> findSignaturesByAccountHolderAccountId(long accountId);
    boolean existsSignatureByAccountHolderAccountId(long accountId);
}
