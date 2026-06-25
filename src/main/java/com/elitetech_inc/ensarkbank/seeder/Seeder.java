package com.elitetech_inc.ensarkbank.seeder;

import com.elitetech_inc.ensarkbank.auth.user.entity.User;
import com.elitetech_inc.ensarkbank.auth.user.repository.UserRepository;
import com.elitetech_inc.ensarkbank.branch.entity.Branch;
import com.elitetech_inc.ensarkbank.branch.repository.BranchRepository;
import com.elitetech_inc.ensarkbank.customer_management.accounts.entity.Account;
import com.elitetech_inc.ensarkbank.customer_management.accounts.repository.AccountRepository;
import com.elitetech_inc.ensarkbank.employee_management.employee.entity.Employee;
import com.elitetech_inc.ensarkbank.employee_management.employee.repository.EmployeeRepository;
import com.elitetech_inc.ensarkbank.enums.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class Seeder
        implements CommandLineRunner {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;

    @Transactional
    @Override
    public void run(String... args) throws ParseException {

        Branch branch = addBranch();
        addEmployee(branch);
        addBankVaultAccount(branch);

    }

    private void addBankVaultAccount(Branch branch) {
        if(accountRepository.findByAccNumber("eb-0000000001").isPresent()) {
            return;
        }

        Account account = new Account();
        account.setAccNumber("eb-0000000001");
        account.setBranch(branch);
        account.setType(AccountType.INTER_BANK_SETTLEMENT);
        account.setAccountStatus(AccountStatus.ACTIVE);
        account.setAvailableBalance(10000000000.00);
        account.setCurrentBalance(10000000000.00);
        accountRepository.save(account);
    }


    private void addEmployee(Branch branch) throws ParseException {
        if(userRepository.findByEmail("ceo@ensarkbank.com").isPresent()){
            return;
        }

        User user = new User();
        user.setEmail("ceo@ensarkbank.com");
        user.setPassword("admin123");
        user.setRole(RoleType.ADMIN);
        user.setEmailVerified(true);
        user.setActive(true);


        Employee  emp = new Employee();
        emp.setName("Md Emon Sarkar");
        emp.setBranch(branch);
        emp.setPhone("8801531767051");
        emp.setDesignation(Designation.CHIEF_EXECUTIVE_OFFICER);
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");
        Date dob = formatter.parse("22/10/1998");
        emp.setDob(dob);
        emp.setUser(userRepository.save(user));
        employeeRepository.save(emp);

    }


    private Branch addBranch() {
        if (branchRepository.existsByRoutingNumber("683000001")) {
            return null;
        }

        Branch branch = new Branch();
        branch.setName("Head Office");
        branch.setType(
                BranchType.HEAD_OFFICE
        );
        branch.setRoutingNumber("683000001");
        branch.setAddress("Motijheel, Dhaka, Bangladesh");
        branch.setEmail("head_office@ensarkbank.com");
        branch.setStatus(BranchStatus.ACTIVE);
        branch.setBranchNumber("01875606083");
        branchRepository.save(branch);

        return branchRepository.save(branch);
    }
}
