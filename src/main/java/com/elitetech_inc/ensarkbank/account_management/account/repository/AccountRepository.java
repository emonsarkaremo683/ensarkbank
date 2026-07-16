package com.elitetech_inc.ensarkbank.account_management.account.repository;

import com.elitetech_inc.ensarkbank.account_management.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account,Long> {
    Optional<Account> findAccountByBranchId(Long branchId);
    List<Account> findAllByBranchId(Long branchId);
    Optional<Account> findAccountByAccountNumber(String accountNumber);
    boolean existsByAccountNumber(String accountNumber);
    boolean existsById(Long id);

    List<Account> findDistinctByHoldersCustomerId(Long customerId);

    @Query("SELECT COUNT(a) > 0 FROM Account a JOIN a.holders h WHERE a.id = :accountId AND h.customer.id = :customerId")
    boolean existsByAccountIdAndCustomerId(@Param("accountId") Long accountId, @Param("customerId") Long customerId);

    @Query("SELECT COUNT(a) > 0 FROM Account a JOIN a.holders h WHERE a.accountNumber = :accountNumber AND h.customer.id = :customerId")
    boolean existsByAccountNumberAndCustomerId(@Param("accountNumber") String accountNumber, @Param("customerId") Long customerId);

    long countByBranchIdIn(List<Long> branchIds);

    long countByBranchId(Long branchId);

    @Query("SELECT COUNT(a) FROM Account a WHERE a.branch.id = :branchId")
    long countByBranchIdDirect(@Param("branchId") Long branchId);

    @Query("SELECT COALESCE(SUM(a.availableBalance), 0) FROM Account a WHERE a.branch.id = :branchId")
    java.math.BigDecimal sumBalanceByBranchId(@Param("branchId") Long branchId);

    @Query("SELECT COALESCE(SUM(a.availableBalance), 0) FROM Account a WHERE a.branch.id IN :branchIds")
    java.math.BigDecimal sumBalanceByBranchIds(@Param("branchIds") List<Long> branchIds);

    @Query("SELECT COALESCE(SUM(a.availableBalance), 0) FROM Account a")
    java.math.BigDecimal sumBalanceAll();

    @Query("SELECT a.branch.id, a.branch.name, COUNT(a), COUNT(DISTINCT ah.customer.id), COALESCE(SUM(a.availableBalance), 0) " +
           "FROM Account a LEFT JOIN a.holders ah " +
           "WHERE a.branch.type <> com.elitetech_inc.ensarkbank.common.enums.BranchType.HEAD_OFFICE " +
           "GROUP BY a.branch.id, a.branch.name")
    List<Object[]> getBranchWiseSummary();

    @Query("SELECT COUNT(DISTINCT ah.customer.id) FROM Account a LEFT JOIN a.holders ah WHERE a.branch.id IN :branchIds")
    long countDistinctCustomersByBranchIds(@Param("branchIds") List<Long> branchIds);

    @Query("SELECT COUNT(DISTINCT ah.customer.id) FROM Account a LEFT JOIN a.holders ah")
    long countDistinctCustomersAll();

    @Query("SELECT a.accountType, COUNT(a) FROM Account a WHERE a.branch.id IN :branchIds GROUP BY a.accountType")
    List<Object[]> countByAccountTypeGrouped(@Param("branchIds") List<Long> branchIds);

    @Query("SELECT a.accountType, COUNT(a) FROM Account a GROUP BY a.accountType")
    List<Object[]> countByAccountTypeGroupedAll();
}
